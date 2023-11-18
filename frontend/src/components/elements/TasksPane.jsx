import { Box, Button, Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import Container from '@mui/material/Container';
import { useEffect, useState } from 'react';
import TaskItem from './TaskItem';
import { setTask, fetchTasks, deleteTask } from '../../common/apiCalls';
import TaskDialogue from './TaskDialogue';
import { useSelector, useDispatch } from "react-redux";
import { setTasks } from "../../common/redux/tasks-slice";
import { createErrorAlert, createSuccessAlert } from '../../common/redux/dispatchers';
import useWebSocket from 'react-use-websocket';
import { entityTypes, eventTypes } from "../../common/web-sockets";
import conf from "../../common/config/properties";

function TasksPane() {
  const [showSent, setShowSent] = useState(false);
  const [dialogueOpen, setDialogueOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState({_id: "", taskType: {id: "", name: ""}, params: []});

  const tasks = useSelector((state) => state.tasks.tasks);
  const selectedImplant = useSelector((state) => state.implants.selected);
  const dispatch = useDispatch();

  const { lastJsonMessage } = useWebSocket(conf.wsURL, {
    onOpen: () => {
      console.log("WebSocket opened");
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
        dispatch(setTasks(received.tasks));
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
      
      dispatch(setTasks(updated));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastJsonMessage]);

  const handleToggle = () => {
    setShowSent(!showSent);
  }

  const handleFormOpen = () => {
    setSelectedTask({_id: "", taskType: {id: "", name: ""}, params: []});
    setDialogueOpen(true);
  }

  const handleFormClose = () => {
    setDialogueOpen(false);
  }

  const handleFormSubmit = async (data) => {
    data.implantId = selectedImplant.id;
    const response = await setTask(data);

    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
      handleFormClose();
      const newList = await fetchTasks(selectedImplant.id, showSent);
      dispatch(setTasks(newList.tasks));
      createSuccessAlert("Successfully created task");
    }
  }

  const handleDelete = async (task) => {
    const res = await deleteTask(task);

    if (res.errors.length > 0) {
      createErrorAlert(res.errors);
    } else {
      const newList = await fetchTasks(selectedImplant.id, showSent);
      dispatch(setTasks(newList.tasks));
      createSuccessAlert("Successfully deleted task");
    }
  }

  const handleEdit = (task) => {
    const editTask = {
      _id: task._id,
      taskType: {
        id: task.taskType.id,
        name: task.taskType.name,
      },
      params: task.params,
    };
    setSelectedTask(editTask);
    setDialogueOpen(true);
  }

  let tasksItems = null;

  if (tasks !== undefined && tasks !== null) {
    if (showSent) {
      tasksItems = tasks.map(task => {
        return <TaskItem task={task} key={task.order} deleteTask={() => handleDelete(task)} editTask={() => handleEdit(task)} />
      });
    } else {
      const filtered = tasks.filter(task => task.sent === false);
      tasksItems = filtered.map(task => {
        return <TaskItem task={task} key={task._id} deleteTask={() => handleDelete(task)} editTask={() => handleEdit(task)} />
      });
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
      {dialogueOpen && <TaskDialogue open={dialogueOpen} onClose={handleFormClose} onSubmit={handleFormSubmit} providedTask={selectedTask} />}      
    </Container>      
  )
}

export default TasksPane;