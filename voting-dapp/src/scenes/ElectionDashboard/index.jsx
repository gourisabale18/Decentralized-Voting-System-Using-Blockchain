import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Box, Card, CardContent, CardActions, Button, Typography, TextField } from "@mui/material";

const ElectionList = ({ contract, currentAccount, setElectionId }) => {
  const [elections, setElections] = useState([]);
  const [newElectionName, setNewElectionName] = useState("");

    const fetchElections = async () => {
      if (contract) {
        try {
            const result = await contract.methods.getAllElections().call();
            const ids = result[0];
            const names = result[1];
            const states = result[2];
            
            const electionList = ids.map((id, index) => ({
              id,
              name: names[index],
              state: states[index],
            }));
          console.log("Fetched Elections:", electionList);
          setElections(electionList);
        } catch (error) {
          console.error("Failed to fetch elections:", error);
        }
      }
    };
    
    useEffect(() => {
        fetchElections(); // Fetch all elections when the component mounts
      }, [contract]); // Only re-run if the contract changes
    
  

  const handleDeleteElection = async (electionId) => {
    if (contract && currentAccount) {
      await contract.methods.deleteElection(electionId).send({ from: currentAccount });
      // Refresh the election list after deletion
      setElections(elections.filter(election => election.id !== electionId));
    }
  };

  const handleCreateElection = async () => {
    if (contract && currentAccount && newElectionName.trim() !== "") {
      await contract.methods.createElection(newElectionName).send({ from: currentAccount });
      // Clear the new election name and fetch elections again to refresh the list
      setNewElectionName("");
      fetchElections(); // Fetch all elections when the component mounts
    }
  };

  const getStateDescription = (stateCode) => {
    const states = ["NotStarted", "InProgress", "Ended"];
    return states[stateCode] || "Unknown";
  };
  

  return (
    <Box>
      <Box>
        <TextField
          label="New Election Name"
          value={newElectionName}
          onChange={(e) => setNewElectionName(e.target.value)}
          placeholder="Enter new election name"
        />
        <Button onClick={handleCreateElection}>Create Election</Button>
      </Box>

      <Box>
  {elections.map((election) => (
    <Card key={election.id.toString()} sx={{ margin: "10px", padding: "10px" }}> {/* Ensure key is unique and valid */}
      <CardContent>
        <Typography variant="h5">Election ID: {election.id.toString()}</Typography>
        <Typography variant="body1">Election Name: {election.name}</Typography>
        <Typography variant="body2">State: {getStateDescription(election.state)}</Typography>
      </CardContent>

      <CardActions>
        <Button onClick={() => setElectionId(election.id)}>Select</Button>
        {getStateDescription(election.state) === 'Ended' && ( // Assuming 'Ended' state corresponds to code 2
          <Button
            color="error"
            onClick={() => handleDeleteElection(election.id)}
          >
            Delete
          </Button>
        )}
      </CardActions>
    </Card>
  ))}
</Box>

    </Box>
  );
};

ElectionList.propTypes = {
    contract: PropTypes.object.isRequired,
    currentAccount: PropTypes.string.isRequired,
    setElectionId:() => {},
  };

export default ElectionList;
