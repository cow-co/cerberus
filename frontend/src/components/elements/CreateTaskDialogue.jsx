import { useState, useEffect } from 'react';
import { fetchTaskTypes } from '../../functions/apiCalls';
import { InputLabel, FormControl, MenuItem, Select, Dialog, DialogTitle, Button, TextField } from '@mui/material';

const CreateTaskDialogue = (props) => {
  const {onClose, open, onSubmit} = props
  const [taskTypes, setTaskTypes] = useState([""])
  const [task, setTask] = useState({type: "", params: []})

  useEffect(() => {
    const getData = async () => {
      const types = await fetchTaskTypes()
      setTaskTypes(types)
    }
    getData()
  }, [])

  const handleChange = (event) => {
    console.log("Selected " + event.target.value)
    const selectedTaskTypes = taskTypes.filter(val => val.name === event.target.value)
    // Needs to be a new object, else React does not realise a change has been made, it seems
    let updated = {
      type: task.type,
      params: task.params
    }
    // The length *should* be precisely 1, but we cover off the scenario where we might have accidentally 
    // seeded multiple identical task types.
    if (selectedTaskTypes.length > 0) {
      const name = selectedTaskTypes[0].name
      updated.type = name
      updated.params = selectedTaskTypes[0].params
      updated.params = selectedTaskTypes[0].params.map(param => {
        return {
          name: param,
          value: ""
        }
      })
      setTask(updated)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const handleSubmit = () => {
    onSubmit(task)
  }

  const handleParamUpdate = (event) => {
    const {key, value} = event.target
    let updated = task
    updated.params.forEach(param => {
      if (param.name === key) {
        param.value = value
      }
    })
    updated.params[key] = value
    setTask(updated)
  }
  
  console.log(taskTypes.length)
  const taskTypeSelects = taskTypes.map(taskType => {
    console.log(taskType._id)
    return <MenuItem value={taskType.name} key={taskType._id}>{taskType.name}</MenuItem>
  })
  const paramsSettings = task.params.map(param => (<TextField label={param.name} variant="outlined" key={param.name} id={param.name} value={param.value} onChange={handleParamUpdate} />))

  return (
    <Dialog onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Create New Task</DialogTitle>
      <FormControl fullWidth>
        <InputLabel id="task-type-label">Task Type</InputLabel>
        <Select labelId="task-type-label" value={task.type} label="Task Type" onChange={handleChange}>
          {taskTypeSelects}
        </Select>
        {paramsSettings}
        <Button onClick={handleSubmit}>Create</Button>
      </FormControl>
    </Dialog>
  )
}

export default CreateTaskDialogue