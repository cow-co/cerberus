import { Button, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskTypeItem from './TaskTypeItem';
import { createTaskType, fetchTaskTypes, deleteTaskType } from '../../functions/apiCalls';
import CreateTaskTypeDialogue from './CreateTaskTypeDialogue';
import { useSelector, useDispatch } from "react-redux";
import { setTaskTypes } from "../../common/redux/tasks-slice";
import conf from "../../common/config/properties";
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { v4 as uuidv4 } from "uuid";

function TaskTypesPane() {
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const taskTypes = useSelector((state) => state.tasks.taskTypes);
  const dispatch = useDispatch();

  const handleFormOpen = () => {
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    const response = await createTaskType(data);
    if (response.errors.length > 0) {
      response.errors.forEach((error) => {
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "error",
          message: error
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
      });
    } else {
      handleFormClose();
      const newList = await fetchTaskTypes();
      dispatch(setTaskTypes(newList.taskTypes));
      const uuid = uuidv4();
      const alert = {
        id: uuid,
        type: "success",
        message: "Successfully Created Task Type"
      };
      dispatch(addAlert(alert));
      setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
    }
  }

  const handleDelete = async (taskType) => {
    const errors = await deleteTaskType(taskType._id);

    if (errors.length > 0) {
      errors.forEach((error) => {
        const uuid = uuidv4();
        const alert = {
          id: uuid,
          type: "error",
          message: error
        };
        dispatch(addAlert(alert));
        setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
      });
    } else {
      const newList = await fetchTaskTypes();
      dispatch(setTaskTypes(newList.taskTypes));
      const uuid = uuidv4();
      const alert = {
        id: uuid,
        type: "success",
        message: "Successfully Deleted Task Type"
      };
      dispatch(addAlert(alert));
      setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
    }

  }

  useEffect(() => {
    async function callFetcher() {
      console.log("Fetching task types");
      const received = await fetchTaskTypes();
      dispatch(setTaskTypes(received.taskTypes));
    }
    callFetcher()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let taskTypesItems = null;

  if (taskTypes !== undefined && taskTypes !== null) {
    taskTypesItems = taskTypes.map(taskType => {
      return <TaskTypeItem taskType={taskType} key={taskType.order} deleteTaskType={() => handleDelete(taskType)} />
    });
  }

  return (
    <Container fixed>
      <Typography align="center" variant="h3">Task Types</Typography>
      <List>
        {taskTypesItems}
      </List>
      <Button variant='contained' onClick={handleFormOpen}>Create Task Type</Button>
      <CreateTaskTypeDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    </Container>
      
  )
}

export default TaskTypesPane;