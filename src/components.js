import { useState, memo, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery, useMutation } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import 'bootstrap/dist/css/bootstrap.css'
import { startInstance, getVariable, updateVariable } from './async.js';

import styles from './index.css'
import { process_defKey } from './index.js'

const queryClient = new QueryClient();
const ProcessContext = createContext();
const RefetchContext = createContext();

export function App(props) {
  // queryClient enables use of external queries
  // contextProvider enables "global state"
  // queryClient provider wraps context provider
  const process_id = props.process_id;
  const [stale, setStale] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <ProcessContext.Provider value={ process_id }>
      <RefetchContext.Provider value={{ stale, setStale}}>
        <AppContent />
      </RefetchContext.Provider>
      </ProcessContext.Provider>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>

  );
}

const AppContent = memo(() => {
  return (
    <div>
      <ReportNotifiable />
      <BreachDetails />
    </div>
  );
})

function ReportNotifiable() {
  const queryClient = useQueryClient()
  const process_id = useContext(ProcessContext);
  const { stale, setStale } = useContext(RefetchContext);
  const varName = 'act26b_1'

  const { data, isLoading, error } = useQuery( // React-query re-fetches data for render whenever query key changes
    [process_id, varName, stale], () =>
    getVariable(process_id, varName), {
      refetchInterval: 1000
    }// TODO: fiddle with cache-time 
  )

  console.log("26b_1", isLoading, error, data);

  if (error) return <span>Error: {error} </span>
  setStale(false);

  return (
    <div>
      {isLoading ? <span>Loading...</span> : <h6>The breach is <h1>{ data.data.value ? "NOTIFIABLE" : "NOT NOTIFIABLE" }.</h1></h6>}
    </div>
  );
}

function BreachDetails() {
  const queryClient = useQueryClient()
  const process_id = useContext(ProcessContext);
  const { stale, setStale } = useContext(RefetchContext);
  const varName = 'act26b_4'

  const { data, isLoading, error } = useQuery(
    [process_id, varName, stale], () => {
      getVariable(process_id, varName);
    }
  )
  
  return (
    <div>
    { error && <span>Error:  </span>}
    { isLoading ? <span>Loading... </span> : 
      <CheckBox 
        value= {false}// { data.data.value } 
        label="Did the breach occur only within the organization?"
        setter={ setStale }
        varName = { varName }
      />}
    </div>
  );
}

function CheckBox({value, label, setter, varName}) {
  const process_id = useContext(ProcessContext);

  const { mutate }= useMutation(vars => {
    console.log("mutate vars", vars)
    updateVariable(vars.process_id, vars.varName, vars.newState, "boolean")
  })

  if (value) return (
    <label>
      <input type="checkbox"
        checked 
        onChange = {(event) => {
          // TODO: send query with update
          const newState = event.target.checked;
          mutate({process_id, varName, newState});
          setTimeout(setter(newState), 1500);
        }}
      ></input>
      {label}
    </label>
  );
  else return (
    <label>
      <input type="checkbox"
        onChange = {(event) => {
          // TODO: send query with update
          const newState = event.target.checked;
          mutate({process_id, varName, newState});
          setTimeout(setter(newState), 1500);
        }}
      ></input>
      {label}
    </label>
  );
}