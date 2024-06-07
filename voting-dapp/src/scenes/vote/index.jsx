import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Button,
  Typography,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import PropTypes from "prop-types";

import CandidateCard from "@/shared/CandidateCard";

const Vote = ({ contract, currentAccount, ElectionID }) => {
  const [candidates, setCandidates] = useState([]);
  const [vote, setVote] = useState(null);
  const [open, setOpen] = useState(false);
  const [voteAdded, setVoteAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [electionState, setElectionState] = useState(0);

  const getCandidates = async () => {
    if (contract) {
      const election = await contract.methods.elections(ElectionID).call();
      const count = election.candidatesCount;
      const temp = [];
      for (let i = 0; i < count; i++) {
        const candidate = await contract.methods
          .getCandidateDetails(ElectionID, i)
          .call();
        temp.push({
          name: candidate[0],
          votes: candidate[1],
          gender: candidate[2],
        });
      }
      setCandidates(temp);
    }
  };

  const voteCandidate = async (candidate) => {
    try {
      if (contract) {
        await contract.methods
          .vote(ElectionID, candidate)
          .send({ from: currentAccount });
        getCandidates();
        setSuccessMessage("Succesfully voted");
        setVoteAdded(true);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage("You already voted");
      setOpen(true);
    }
  };

  const getElectionState = async () => {
    if (contract) {
      const election = await contract.methods.elections(ElectionID).call();
      const state = election.state;
      setElectionState(parseInt(state));
    }
  };

  useEffect(() => {
    getElectionState();
    getCandidates();
  }, [contract]);

  const handleVoteChange = (event) => {
    setVote(event.target.value);
  };

  const handleVote = (event) => {
    event.preventDefault();
    voteCandidate(vote);
  };
  return (
    <Box>
      <form onSubmit={handleVote}>
        <Grid container sx={{ mt: 0 }} spacing={6} justifyContent="center">
          <Grid item xs={12}>
            <Typography align="center" variant="h6">
              {electionState === 0 &&
                "Please Wait... Election has not started yet."}
              {electionState === 1 && "VOTE FOR YOUR FAVOURITE CANDIDATE"}
              {electionState === 2 &&
                "Election has ended. See the results below."}
            </Typography>
            <Divider />
          </Grid>
          {electionState === 1 && (
            <>
              <Grid item xs={12}>
                <FormControl>
                  <RadioGroup
                    row
                    sx={{
                      overflowY: "hidden",
                      overflowX: "auto",
                      display: "flex",
                      width: "98vw",
                      justifyContent: "center",
                    }}
                    value={vote}
                    onChange={handleVoteChange}
                  >
                    {candidates.map((candidate, index) => (
                      <FormControlLabel
                        key={index}
                        labelPlacement="top"
                        control={<Radio />}
                        value={index}
                        label={
                          <CandidateCard
                            id={index}
                            name={candidate.name}
                            gender={candidate.gender}
                          />
                        }
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <div style={{ margin: 20 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ width: "100%" }}
                  >
                    Vote
                  </Button>
                </div>
              </Grid>
            </>
          )}

          {electionState === 2 && (
            <Grid
              item
              xs={12}
              sx={{
                overflowY: "hidden",
                overflowX: "auto",
                display: "flex",
                width: "98vw",
                justifyContent: "center",
              }}
            >
              {candidates &&
                candidates.map((candidate, index) => (
                  <Box sx={{ mx: 2 }} key={index}>
                    <CandidateCard
                      id={index}
                      name={candidate.name}
                      gender={candidate.gender}
                      voteCount={candidate.votes}
                    />
                  </Box>
                ))}
            </Grid>
          )}
        </Grid>
      </form>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        sx={{
          ".MuiSnackbar-root": {
            top: "50%", // Overrides the top position
            transform: "translateY(-50%)", // Adjusts vertical alignment
          },
        }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={voteAdded}
        autoHideDuration={6000}
        onClose={() => setVoteAdded(false)}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}
        sx={{
          ".MuiSnackbar-root": {
            top: "50%", // Overrides the top position
            transform: "translateY(-50%)", // Adjusts vertical alignment
          },
        }}
      >
        <Alert
          onClose={() => setVoteAdded(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

Vote.propTypes = {
  contract: PropTypes.object.isRequired,
  currentAccount: PropTypes.string.isRequired,
};

export default Vote;
