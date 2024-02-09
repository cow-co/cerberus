import { useEffect, useState } from 'react';
import { FormControl, Dialog, DialogTitle, Button, TextField, DialogContent, DialogContentText } from '@mui/material';
import { changePassword, getSecurityConfig } from "../../../common/apiCalls";
import { createErrorAlert, createSuccessAlert } from '../../../common/redux/dispatchers';

const PasswordChangeDialogue = ({onClose, open}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [secConf, setSecConf] = useState({pkiEnabled: false, passwordReqs: null});

  useEffect(() => {
    async function getSecConf() {
      const json = await getSecurityConfig();
      setSecConf(json);
    }
    getSecConf();
  }, []);

  const handleClose = () => {
    setOldPassword("");
    setPassword("");
    setConfirmPassword("");
    onClose();
  }

  const handleSubmit = async () => {
    const response = await changePassword(oldPassword, password, confirmPassword);
    if (response.errors.length > 0) {
      createErrorAlert(response.errors);
    } else {
        createSuccessAlert("Successfully changed password");
        handleClose();
    }
  }

  const handleOldPasswordUpdate = (event) => {
    setOldPassword(event.target.value);
  }

  const handlePasswordUpdate = (event) => {
    setPassword(event.target.value);
  }

  const handleConfirmPasswordUpdate = (event) => {
    if (event.target.value !== password) {
      setError("Password and Confirmation must match");
    } else {
      setError("");
    }
    setConfirmPassword(event.target.value);
  }
  
  const form = secConf.pkiEnabled
    ? null
    : <FormControl fullWidth>
        <TextField type="password" className='text-input' label="Old Password" variant="outlined" value={oldPassword} onChange={handleOldPasswordUpdate} disabled={secConf.pkiEnabled} />
        <TextField type="password" className='text-input' label="New Password" variant="outlined" value={password} onChange={handlePasswordUpdate} disabled={secConf.pkiEnabled} />
        <TextField type="password" className='text-input' label="Confirm New Password" variant="outlined" value={confirmPassword} error={error !== ""} helperText={error} onChange={handleConfirmPasswordUpdate} disabled={secConf.pkiEnabled} />
        <Button onClick={handleSubmit} disabled={error !== ""}>Submit</Button>
      </FormControl>;
  
  const pwReqsExplainer = secConf.pkiEnabled
    ? null
    : <DialogContent>
        <DialogContentText>
          Password Requirements:
        </DialogContentText>        
        <DialogContentText>
          <pre>
            {JSON.stringify(secConf.passwordReqs)}
          </pre>
        </DialogContentText>
      </DialogContent>;

  return (
    <Dialog className="form-dialog" onClose={handleClose} open={open} fullWidth maxWidth="md">
      <DialogTitle>Change Password</DialogTitle>
      {form}
      {pwReqsExplainer}
    </Dialog>
  );
}

export default PasswordChangeDialogue;