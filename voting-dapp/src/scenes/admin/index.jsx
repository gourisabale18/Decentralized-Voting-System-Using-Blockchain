import { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Button,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { LiveTvRounded } from "@mui/icons-material";
import PropTypes from "prop-types";

import CandidateCard from "@/shared/CandidateCard";
import CandidateForm from "@/shared/CandidateForm";
import VoterForm from "@/shared/VoterForm";

const Admin = ({ contract, web3, currentAccount, ElectionID }) => {
  const [electionState, setElectionState] = useState(0);
  console.log(electionState);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [winner, setWinner] = useState({ name: "", voteCount: "" });


  const getCandidates = async () => {
    if (contract) {
      console.log(contract);
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
      setLoading(false);
      console.log(temp);
    }
  };

  const getElectionState = async () => {
    if (contract) {
      const election = await contract.methods.elections(ElectionID).call();
      const state = election.state;
      setElectionState(parseInt(state));
      if (parseInt(state) === 2) { // If election has ended, declare the winner
        await declareWinner();
      }
    }
  };

  useEffect(() => {
    getElectionState();
    getCandidates();
  }, [contract]);


  const handleEnd = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgree = async () => {
    if (electionState === 0) {
      try {
        if (contract) {
          await contract.methods
            .startElection(ElectionID)
            .send({ from: currentAccount });
          getElectionState();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else if (electionState === 1) {
      try {
        if (contract) {
          await contract.methods
            .endElection(ElectionID)
            .send({ from: currentAccount });
          getElectionState();
          
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    setOpen(false);
  };

  const declareWinner = async () => {
    try {
      if (contract) {
        const winnerDetails = await contract.methods
        .declareWinner(ElectionID)
        .call({ from: currentAccount });
          console.log("Winner is", winnerDetails);
        setWinner({
          name: winnerDetails[0],
          voteCount: winnerDetails[1].toString(),
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Box>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          Loading...
        </Box>
      ) : (
        <Box>
          <Grid container sx={{ mt: 0 }} spacing={4}>
            <Grid item xs={12}>
              <Typography align="center" variant="h6" color="textSecondary">
                ELECTION STATUS :{" "}
                {electionState === 0 && "Election has not started."}
                {electionState === 1 && "Election is in progress."}
                {electionState === 2 && "Election has ended."}
              </Typography>
              <Divider />
            </Grid>
            {electionState !== 2 && (
              <Grid item xs={12} sx={{ display: "flex" }}>
                <Button
                  variant="contained"
                  sx={{ width: "40%", margin: "auto" }}
                  onClick={handleEnd}
                >
                  {electionState === 0 && "Start Election"}
                  {electionState === 1 && "End Election"}
                </Button>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography align="center" variant="h6">
                {electionState === 0 && "ADD VOTERS / CANDIDATES"}
                {electionState === 1 && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "top",
                      justifyContent: "center",
                    }}
                  >
                    <LiveTvRounded sx={{ mr: 1, fontSize: "20" }} />
                    LIVE RESULT
                  </Box>
                )}
                {electionState === 2 && "FINAL ELECTION RESULT"}
              </Typography>
              <Divider />
            </Grid>

          {electionState === 2 && (
            <Grid item xs={12}>
            <Box>
              <Typography variant="h6" align="center" gutterBottom>
                Winner: {winner.name}
              </Typography>
              <Typography variant="body1" align="center">
                Votes: {winner.voteCount}
              </Typography>
            </Box>
            </Grid>
          )}

            {electionState === 0 && (
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
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <CandidateForm
                    contract={contract}
                    web3={web3}
                    currentAccount={currentAccount}
                    ElectionID={ElectionID}
                  />
                  <VoterForm
                    contract={contract}
                    web3={web3}
                    currentAccount={currentAccount}
                    ElectionID={ElectionID}
                  />
                </Box>
              </Grid>
            )}

            {electionState > 0 && (
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

          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {electionState === 0 && "Do you want to start the election?"}
                {electionState === 1 && "Do you want to end the election?"}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Disagree</Button>
              <Button onClick={handleAgree} autoFocus>
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  );
};

Admin.propTypes = {
  contract: PropTypes.object.isRequired,
  currentAccount: PropTypes.string.isRequired,
  web3: PropTypes.object.isRequired,
};

export default Admin;