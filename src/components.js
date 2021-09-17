import { useState, memo, createContext, useContext, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery, useMutation } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'

import 'bootstrap/dist/css/bootstrap.css'
import { getVariable, updateVariable, getAllVariables } from './async.js';
import { varLabelMap } from './varLabelMap.js';

import styles from './index.css'

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
  const [schema, setSchema] = useState({});

  return (
    <QueryClientProvider client={queryClient}>
      <ProcessContext.Provider value={process_id}>
        <RefetchContext.Provider value={{ stale, setStale }}>
          <VariableContext.Provider value={{ schema, setSchema }}>
            <AppContent />
          </VariableContext.Provider>
        </RefetchContext.Provider>
      </ProcessContext.Provider>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  );
}

function AppContent() {
  const queryClient = useQueryClient()
  const process_id = useContext(ProcessContext);
  const { stale, setStale } = useContext(RefetchContext);
  const { schema, setSchema } = useContext(VariableContext);

  const { data, isLoading, error } = useQuery(
    [process_id, stale], () => getAllVariables(process_id), { refetchInterval: 200 });

  if (isLoading) return <span>Loading...</span>
  if (error) return <span>Error occured!</span>

  const varObj = data.data;
  varLabelMap.map((keyVal) => {
    const toMod = varObj[`${keyVal[0]}`]
    varObj[`${keyVal[0]}`] = { ...toMod, label: keyVal[1] };
    return keyVal;
  })

  setSchema(varObj);

  return (
    <div>
      <ReportNotifiable />
      <BreachDetails />
    </div>
  );
}

function ReportNotifiable() {
  const queryClient = useQueryClient()
  const process_id = useContext(ProcessContext);
  const { stale, setStale } = useContext(RefetchContext);
  const { schema, setSchema } = useContext(VariableContext);

  const varName = 'act26b_1'
  if (JSON.stringify(schema) === "{}") return <span></span>;
  console.log(schema[varName]);
  return (
    <div>
      { JSON.stringify(schema) === "{}" ? <span></span> : <span><b>The breach is </b><h1>{schema[varName].value ? "NOTIFIABLE" : "NOT NOTIFIABLE"}.</h1></span> }
    </div>
  );
}

function BreachDetails() {
  const {schema, setSchema } = useContext(VariableContext);
  if (JSON.stringify(schema) === "{}") return <span></span>;

  return (
    <div>
      {varLabelMap.map((k, _) => {
        return (
          <CheckBox
            varName={k[0]}
          />);
      })
      }
    </div>
  );
}

function CheckBox({ varName }) {
  const queryClient = useQueryClient()
  const process_id = useContext(ProcessContext);
  const { stale, setStale } = useContext(RefetchContext);
  const {schema, setSchema } = useContext(VariableContext);

  // update function
  const { mutate } = useMutation(vars => {
    updateVariable(vars.process_id, vars.varName, vars.newState, "boolean")
  })

  return (
    <div>
        <label>
          <input type="checkbox"
            checked={schema[varName].value}
            onChange={(event) => {
              const newState = event.target.checked;
              mutate({ process_id, varName, newState });
              setTimeout(setStale(newState),200);
            }}
          ></input>
          <span>{schema[varName].label}</span>
        </label>
    </div>
  );
}