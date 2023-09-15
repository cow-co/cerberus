import { Box, Button, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { createTask, fetchTasks } from '../../functions/apiCalls';
import CreateTaskDialogue from './CreateTaskDialogue';

function TasksPane({selectedImplant}) {
  const [showSent, setShowSent] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
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
    await createTask(data)
    handleFormClose()
    const newList = await fetchTasks(selectedImplant.id, showSent)
    setTasks(newList)
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
    console.log(JSON.stringify(tasks))
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