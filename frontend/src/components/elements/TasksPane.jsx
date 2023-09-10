import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel, List } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';

// TODO Perhaps move all the backend-interaction code to its own file?
function TasksPane({selectedImplant}) {
  const [showSent, setShowSent] = useState(false);
  const [tasks, setTasks] = useState([]);
  console.log("Rendering with implant: " + JSON.stringify(selectedImplant))

  const handleToggle = () => {
    setShowSent(!showSent)
  }

  useEffect(() => {
    async function fetchTasks() {
      // TODO try/catch and error handling
      // TODO Make the backend URL configurable#
      const response = await fetch("http://localhost:5000/api/implants?includeSent=true")
      const json = await response.json()
      if (showSent) {
        setTasks(json.tasks)
      } else {
        setTasks(json.tasks.filter(task => task.sent === false))
      }
    }
    fetchTasks()
  }, [selectedImplant])

  const tasksItems = tasks.map(task => {
    return <TaskItem task={task} />
  })

  return (
    <Container fixed>
      <h2>Tasks for {selectedImplant.id}</h2>
      <FormControlLabel control={<Checkbox checked={showSent} onClick={handleToggle}/>} label="Show Sent" />
      <List>
        {tasksItems}
      </List>
    </Container>
  )
}

export default TasksPane;