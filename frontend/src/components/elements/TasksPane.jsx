import { Alert, Box, Button, Checkbox, FormControlLabel, List, Snackbar, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { createTask, fetchTasks } from '../../functions/apiCalls';
import CreateTaskDialogue from './CreateTaskDialogue';
import { useSelector, useDispatch } from "react-redux"
import { setTasks } from "../../common/redux/tasks-slice"

function TasksPane() {
  const [showSent, setShowSent] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const tasks = useSelector((state) => state.tasks.tasks);
  const selectedImplant = useSelector((state) => state.implants.selected);
  const dispatch = useDispatch();
  const [alerts, setAlerts] = useState([]);

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
      setAlerts(errors.map(error => { return {type: "error", message: error} }));
    } else {
      handleFormClose();
      const newList = await fetchTasks(selectedImplant.id, showSent);
      dispatch(setTasks(newList.tasks));
      setAlerts([{type: "success", message: "Task Created"}]);
    }
  }

  useEffect(() => {
    async function callFetcher() {
      const received = await fetchTasks(selectedImplant.id);
      dispatch(setTasks(received.tasks));
    }
    callFetcher()
  }, [selectedImplant, showSent]);

  let tasksItems = null;

  if (tasks !== undefined && tasks !== null) {
    if (showSent) {
      tasksItems = tasks.map(task => {
        return <TaskItem task={task} key={task.order} />
      });
    } else {
      const filtered = tasks.filter(task => task.sent === false);
      tasksItems = filtered.map(task => {
        return <TaskItem task={task} key={task.order} />
      });
    }
  }

  let alertItems = null;

  if (alerts.length > 0) {
    alertItems = alerts.map(alert => <Alert severity={alert.type}>{alert.message}</Alert>);
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
      {alertItems}
    </Container>
      
  )
}

export default TasksPane;