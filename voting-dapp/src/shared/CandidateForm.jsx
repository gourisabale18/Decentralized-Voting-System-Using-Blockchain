import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import PropTypes from "prop-types";

const CandidateForm = ({ contract, currentAccount, ElectionID }) => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");

  const handleForm = async (event) => {
    event.preventDefault();
    try {
      await contract.methods
        .addCandidate(ElectionID, name, gender)
        .send({ from: currentAccount });
      console.log("candidate added");
    } catch (error) {
      console.log(error);
    }
    setName("");
    setGender("");
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleGenderChange = (event) => {
    setGender(event.target.value);
  };

  return (
    <Box
      sx={{
        padding: "2rem",
        width: "40%",
      }}
      component="form"
      noValidate
      autoComplete="off"
      onSubmit={handleForm}
    >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <TextField
            id="outlined-basic"
            label="Candidate Name"
            variant="outlined"
            value={name}
            onChange={handleNameChange}
            sx={{ width: "100%", margin: "auto" }}
          />
        </Grid>
        <Grid item>
          <FormControl fullWidth>
            <InputLabel id="gender-select-label">Gender</InputLabel>
            <Select
              labelId="gender-select-label"
              id="gender-select"
              value={gender}
              label="Gender"
              onChange={handleGenderChange}
              sx={{ width: "100%", margin: "auto" }}
            >
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            type="submit"
            sx={{ width: "100%", margin: "auto" }}
          >
            Add Candidates
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

CandidateForm.propTypes = {
  contract: PropTypes.object.isRequired,
  currentAccount: PropTypes.string.isRequired,
};
export default CandidateForm;
