import { List } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';

function TasksPane({selectedImplant}) {
  const [tasks, setTasks] = useState([]);
  console.log("Rendering with implant: " + JSON.stringify(selectedImplant))

  const refresh = async () => {
    // TODO try/catch and error handling
    // TODO Make the backend URL configurable#
    const response = await fetch("http://localhost:5000/api/implants?includeSent=true")
    const json = await response.json()
    setTasks(json.tasks)
  }

  useEffect(() => {
    refresh()
  }, [selectedImplant])

  const tasksItems = tasks.map(task => {
    return <TaskItem task={task} />
  })

  // TODO Checkbox for whether to show sent tasks
  return (
    <Container fixed>
      <h2>Tasks for {selectedImplant.id}</h2>
      <Button variant='contained' onClick={refresh}>Refresh</Button>
      <List>
        {tasksItems}
      </List>
    </Container>
  )
}

export default TasksPane;