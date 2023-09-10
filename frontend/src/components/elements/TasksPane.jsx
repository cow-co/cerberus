import { Checkbox, FormControlLabel, List } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { fetchTasks } from '../../functions/apiCalls';

// TODO Perhaps move all the backend-interaction code to its own file?
function TasksPane({selectedImplant}) {
  const [showSent, setShowSent] = useState(false);
  const [tasks, setTasks] = useState([]);
  console.log("Rendering with implant: " + JSON.stringify(selectedImplant))

  const handleToggle = () => {
    setShowSent(!showSent)
  }

  useEffect(() => {
    async function callFetcher() {
      const received = await fetchTasks(selectedImplant.id, showSent)
      setTasks(received)
    }
    callFetcher()
  }, [selectedImplant, showSent])

  let tasksItems = null

  if (tasks !== undefined && tasks !== null) {
    console.log(tasks)
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
    </Container>
  )
}

export default TasksPane;