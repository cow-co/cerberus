import { Box, Button, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { setTask, fetchTasks, deleteTask } from '../../../common/apiCalls';
import TaskDialogue from './TaskDialogue';
import { useSelector, useDispatch } from "react-redux";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';
import { setMessage, setOpen, setSubmitAction } from "../../../common/redux/confirmation-slice";
import { setSelectedTask } from "../../../common/redux/tasks-slice";
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../../common/web-sockets";
import conf from "../../../common/config/properties";
import { EMPTY_TASK } from '../../../common/utils';

function TasksPane() {
  const [showSent, setShowSent] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [tasks, setTasks] = useState([]);

  const selectedImplant = useSelector((state) => state.implants.selected);
  const dispatch = useDispatch();

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      
    },
    share: true,  // This ensures we don't have a new connection for each component etc. 
    filter: (message) => {
      const data = JSON.parse(message.data);
      return data.entityType === entityTypes.TASKS;
    },
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    async function callFetcher() {
      if (selectedImplant.id) {
        const received = await fetchTasks(selectedImplant.id);
        setTasks(received.tasks);
      }
    }
    callFetcher()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImplant, showSent]);

  useEffect(() => {
    if (lastJsonMessage) {
      let updated = [...tasks];

      switch (lastJsonMessage.eventType) {
        case eventTypes.CREATE:
          if (lastJsonMessage.entity.implantId === selectedImplant.id) {
            updated.push(lastJsonMessage.entity);
          }
          break;
        case eventTypes.EDIT:
          updated = updated.map(task => {
            if (task._id === lastJsonMessage.entity._id) {
              return lastJsonMessage.entity;
            } else {
              return task;
            }
          });
          break;
        case eventTypes.DELETE:
          updated = updated.filter(task => task._id !== lastJsonMessage.entity._id);
          break;
        default:
          break;
      }
      
      setTasks(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const handleToggle = () => {
    setShowSent(!showSent);
  }

  const handleFormOpen = () => {
    dispatch(setSelectedTask({_id: "", implantId: selectedImplant.id, taskType: {id: "", name: ""}, params: []}));
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    console.log(data)
    const response = await setTask(data);

    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
      handleFormClose();
      const newList = await fetchTasks(selectedImplant.id, showSent);
      setTasks(newList.tasks);
      createSuccessAlert("Successfully created task");
    }
  }

  const handleConfirmOpen = (task) => {
    dispatch(setSelectedTask(task));  
    dispatch(setMessage(`Delete Task?`));
    dispatch(setSubmitAction(handleDelete));
    dispatch(setOpen(true));
  }

  const handleDelete = async () => {
    const res = await deleteTask();

    if (res.errors.length > 0) {
      createErrorAlert(res.errors);
    } else {
      const newList = await fetchTasks(selectedImplant.id, showSent);
      setTasks(newList.tasks);
      createSuccessAlert("Successfully deleted task");
    }

    dispatch(setSelectedTask(EMPTY_TASK));  
    dispatch(setOpen(false));
  }

  const handleEdit = (task) => {
    const editTask = structuredClone(task);
    dispatch(setSelectedTask(editTask));
    setDialogueOpen(true);
  }

  let tasksItems = null;

  if (tasks !== undefined && tasks !== null) {
    if (showSent) {
      tasksItems = tasks.map(task => {
        return <TaskItem task={task} key={task.order} deleteTask={() => handleConfirmOpen(task)} editTask={() => handleEdit(task)} />
      });
    } else {
      const filtered = tasks.filter(task => task.sent === false);
      tasksItems = filtered.map(task => {
        return <TaskItem task={task} key={task._id} deleteTask={() => handleConfirmOpen(task)} editTask={() => handleEdit(task)} />
      });
    }
  }

  let createButton = null;

  if (selectedImplant._id) {
    createButton = <Button variant='contained' onClick={handleFormOpen}>Create Task</Button>;
  }

  // TODO disable the create-tasks button entirely if user not in the operator groups
  return (
    <Container fixed>
      <Typography align="center" variant="h3">Tasks for {selectedImplant.id}</Typography>
      <Box display="flex" justifyContent="center" alignItems="center">
        <FormControlLabel control={<Checkbox checked={showSent} onClick={handleToggle}/>} label="Show Sent" />
        {createButton}
      </Box>
      <List>
        {tasksItems}
      </List>
      <TaskDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    </Container>
  )
}

export default TasksPane;