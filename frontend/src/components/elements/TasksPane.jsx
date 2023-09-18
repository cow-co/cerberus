import { Box, Button, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { createTask, fetchTasks, deleteTask } from '../../functions/apiCalls';
import CreateTaskDialogue from './CreateTaskDialogue';
import { useSelector, useDispatch } from "react-redux"
import { setTasks } from "../../common/redux/tasks-slice"
import conf from "../../common/config/properties"
import { addAlert, removeAlert } from "../../common/redux/alerts-slice";
import { v4 as uuidv4 } from "uuid"

function TasksPane() {
  const [showSent, setShowSent] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const tasks = useSelector((state) => state.tasks.tasks);
  const selectedImplant = useSelector((state) => state.implants.selected);
  const dispatch = useDispatch();

  const handleToggle = () => {
    setShowSent(!showSent);
  }

  const handleFormOpen = () => {
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    data.implantId = selectedImplant.id;
    const errors = await createTask(data);
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
      handleFormClose();
      const newList = await fetchTasks(selectedImplant.id, showSent);
      dispatch(setTasks(newList.tasks));
      const uuid = uuidv4();
      const alert = {
        id: uuid,
        type: "success",
        message: "Successfully Created Task"
      };
      dispatch(addAlert(alert));
      setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
    }
  }

  const handleDelete = async (task) => {
    const errors = await deleteTask(task);

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
      const newList = await fetchTasks(selectedImplant.id, showSent);
      dispatch(setTasks(newList.tasks));
      const uuid = uuidv4();
      const alert = {
        id: uuid,
        type: "success",
        message: "Successfully Deleted Task"
      };
      dispatch(addAlert(alert));
      setTimeout(() => dispatch(removeAlert(uuid)), conf.alertsTimeout);
    }

  }

  useEffect(() => {
    async function callFetcher() {
      const received = await fetchTasks(selectedImplant.id);
      dispatch(setTasks(received.tasks));
    }
    callFetcher()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImplant, showSent]);

  let tasksItems = null;

  if (tasks !== undefined && tasks !== null) {
    if (showSent) {
      tasksItems = tasks.map(task => {
        return <TaskItem task={task} key={task.order} deleteTask={() => handleDelete(task)} />
      });
    } else {
      const filtered = tasks.filter(task => task.sent === false);
      tasksItems = filtered.map(task => {
        return <TaskItem task={task} key={task.order} deleteTask={() => handleDelete(task)} />
      });
    }
  }

  // TODO move the alerts snackbar out to the mainpage component, so that it applies across everything
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Tasks for {selectedImplant.id}</Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControlLabel control={<Checkbox checked={showSent} onClick={handleToggle}/>} label="Show Sent" />
        <Button variant='contained' onClick={handleFormOpen}>Create Task</Button>
      </Box>
      <List>
        {tasksItems}
      </List>
      <CreateTaskDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    </Container>
      
  )
}

export default TasksPane;