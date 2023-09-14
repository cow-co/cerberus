import { Checkbox, FormControlLabel, IconButton, List } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { fetchTasks } from '../../functions/apiCalls';
import CreateTaskDialogue from './CreateTaskDialogue';
import AddCircleIcon from '@mui/icons-material/AddCircle';

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

  const handleFormSubmit = (data) => {
    
  }

  useEffect(() => {
    async function callFetcher() {
      const received = await fetchTasks(selectedImplant.id, showSent);
      setTasks(received);
    }
    callFetcher()
  }, [selectedImplant, showSent])

  let tasksItems = null

  if (tasks !== undefined && tasks !== null) {
    tasksItems = tasks.map(task => {
      return <TaskItem task={task} key={task.order} />
    })
  }

  return (
    <Container fixed>
      <h2>Tasks for {selectedImplant.id}</h2>
      <FormControlLabel control={<Checkbox checked={showSent} onClick={handleToggle}/>} label="Show Sent" />
      <List>
        {tasksItems}
      </List>
      <IconButton onClick={handleFormOpen}>
        <AddCircleIcon />
      </IconButton>
      <CreateTaskDialogue open={dialogueOpen} onClose={handleFormClose} />
    </Container>
  )
}

export default TasksPane;