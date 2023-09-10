import { List } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';

function TasksPane({selectedImplant}) {
  const [tasks, setTasks] = useState([]);
  console.log("Rendering with implant: " + JSON.stringify(selectedImplant))
  useEffect(() => {
    async function fetchTasks() {
      const response = await fetch(`http://localhost:5000/api/tasks/${selectedImplant.id}`)
      const json = await response.json()
      setTasks(json.tasks)
    }
    fetchTasks()
  }, [selectedImplant])

  const tasksItems = tasks.map(task => {
    return <TaskItem task={task} />
  })

  return (
    <Container fixed>
      <h2>Tasks for {selectedImplant.id}</h2>
      <List>
        {tasksItems}
      </List>
    </Container>
  )
}

export default TasksPane;