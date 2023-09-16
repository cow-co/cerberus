import { Alert, Box, Button, Checkbox, FormControlLabel, List, Snackbar, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { createTask, fetchTasks } from '../../functions/apiCalls';
import CreateTaskDialogue from './CreateTaskDialogue';

function TasksPane({selectedImplant}) {
  const [showSent, setShowSent] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([])
  console.log("Rendering with implant: " + JSON.stringify(selectedImplant));

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
    data.implantId = selectedImplant.id
    const errors = await createTask(data)
    if (errors.length > 0) {
      setAlerts(errors.map(error => { return {type: "error", message: error} }))
    } else {
      handleFormClose()
      const newList = await fetchTasks(selectedImplant.id, showSent)  // TODO Set a success-alert
      setTasks(newList)
      setAlerts([{type: "success", message: "Task Created"}])
    }
  }

  useEffect(() => {
    async function callFetcher() {
      const received = await fetchTasks(selectedImplant.id);
      setTasks(received);
    }
    callFetcher()
  }, [selectedImplant, showSent])

  let tasksItems = null

  if (tasks !== undefined && tasks !== null) {
    if (showSent) {
      tasksItems = tasks.map(task => {
        return <TaskItem task={task} key={task.order} />
      })
    } else {
      const filtered = tasks.filter(task => task.sent === false)
      tasksItems = filtered.map(task => {
        return <TaskItem task={task} key={task.order} />
      })
    }
  }

  let alertItems = null

  if (alerts.length > 0) {
    alertItems = alerts.map(alert => <Alert severity={alert.type}>{alert.message}</Alert>)
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
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={snackbarClose}>
        {alertItems}
      </Snackbar>
    </Container>
      
  )
}

export default TasksPane;