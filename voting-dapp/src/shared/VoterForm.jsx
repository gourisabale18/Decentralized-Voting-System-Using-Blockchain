import { useState } from "react";
import { Box, Button, TextField, Grid } from "@mui/material";
import PropTypes from "prop-types";

const VoterForm = ({ contract, currentAccount, ElectionID }) => {
  const [name, setName] = useState("");
  const handleForm = async (event) => {
    event.preventDefault();
    try {
      await contract.methods.addVoter(ElectionID, name).send({ from: currentAccount });
      console.log("voter added");
    } catch (error) {
      console.log(error);
    }
    setName("");
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
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
            label="Voter Address"
            variant="outlined"
            value={name}
            onChange={handleNameChange}
            sx={{ width: "100%", margin: "auto" }}
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            type="submit"
            sx={{ width: "100%", margin: "auto" }}
          >
            Add Voter
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

VoterForm.propTypes = {
  contract: PropTypes.object.isRequired,
  currentAccount: PropTypes.string.isRequired,
};

export default VoterForm;
