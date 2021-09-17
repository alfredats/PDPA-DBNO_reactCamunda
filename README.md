# PDPA-DBNO_reactCamund: A further experiment on having a React front-end with Camunda

It hasn't been built for deployment. 

## Description
Camunda got big bucks from seed funding recently and it got people excited about BPMN & DMN again. 

Here's an example of how to connect a front-end powered by the React ecosystem with Camunda as a REPL-like enviroment. Given that Camunda's 

## Requires
- Yarn
- Camunda Plaform Run (I used the docker version, it'll probably work with any other version too)
- Camunda Modeler

## Setup

After installing Camunda Platform Run & Camunda Modeler, [start your platform instance](https://docs.camunda.org/manual/7.15/installation/docker/#start-camunda-platform-run-using-docker).

Open `eventDriven.bpmn` and `investment-strategy.dmn` with Camunda Modeler and [deploy them](https://docs.camunda.org/get-started/quick-start/deploy/#use-the-camunda-modeler-to-deploy-the-process).

Upon successful deployment of the BPMN process & DRD diagram, `cd` to project root and run `yarn start`. `react-scripts` should take care of the rest.


