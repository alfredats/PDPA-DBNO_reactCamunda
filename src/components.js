import { useState, memo, createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery, useMutation } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import 'bootstrap/dist/css/bootstrap.css'
import { startInstance, getVariable, updateVariable } from './async.js';

import styles from './index.css'
import { process_defKey } from './index.js'

const prescribedNumber = 500;
const queryClient = new QueryClient();
const ProcessContext = createContext();
const RefetchContext = createContext();
const VariableContext = createContext();

export function App(props) {
  // queryClient enables use of external queries
  // contextProvider enables "global state"
  // queryClient provider wraps context provider
  const process_id = props.process_id;
  const [stale, setStale] = useState(true);
  const vars = [
    [`act26b_4`, `Did it occur only within the organization?`],
    [`act26b_1_a`, `Does it result in, or is likely to result in, significant harm to an individual`],
    [`regs3_1`, `Does it relate to an individual's uniquly identifiable particulars?`],
    [`regs3_1_b`, `Does it relate to personal data, account name, or password of an individual's account with an organization?`],
    [`act26b_1_b`, `Is it, or is it likely to be, of a significant scale?`],
    [`act26b_3_a`, `Does the databbreach affect not fewer than ${ prescribedNumber } people?`],
    [`act26b_3_b`, `Does the databreach relate to other prescribed circumstances?`]
  ]


  return (
    <QueryClientProvider client={queryClient}>
      <ProcessContext.Provider value={process_id}>
        <RefetchContext.Provider value={{ stale, setStale }}>
          <VariableContext.Provider value = {vars}>
            <AppContent />
          </VariableContext.Provider>
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
  }
  )

  if (error) return <span>Error: {error} </span>
  setStale(false);

  return (
    <div>
      {isLoading ? <span>Loading...</span> : <h6>The breach is <h1>{data.data.value ? "NOTIFIABLE" : "NOT NOTIFIABLE"}.</h1></h6>}
    </div>
  );
}

function BreachDetails() {
  const vars = useContext(VariableContext);

  return (
    <div>
      { vars.map((deets, _) => {
        return (
          <CheckBox
            varName={ deets[0] }
            label= { deets[1] } 
          />);
        })
      }
    </div>
  );
}

function CheckBox({ varName, label }) {
  const queryClient = useQueryClient()
  const process_id = useContext(ProcessContext);
  const { stale, setStale } = useContext(RefetchContext);

  // retrieval from server-state
  const { data, isLoading, error } = useQuery(
    [process_id, varName, stale], () =>
    getVariable(process_id, varName), {
    refetchInterval: 500
  }
  )

  // update function
  const { mutate } = useMutation(vars => {
    console.log("mutate vars", vars)
    updateVariable(vars.process_id, vars.varName, vars.newState, "boolean")
  })

  // This definitely isn't the best way to do this...
  return (
    <div>
      {error && <span>Error:  </span>}
      {isLoading ? (<span>Loading... </span>) : (
        <label>
          <input type="checkbox"
            checked={data.data.value}
            onChange={(event) => {
              const newState = event.target.checked;
              mutate({ process_id, varName, newState });
              setTimeout(setStale(newState), 500);
            }}
          ></input>
          {label}
        </label>
      )}
    </div>
  );
}