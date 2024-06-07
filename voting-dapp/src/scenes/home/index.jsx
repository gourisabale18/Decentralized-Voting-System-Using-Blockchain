import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import ElectionContract from "@/contracts/Election.json";
import getWeb3 from "@/helper/getWeb3";

import Admin from "@/scenes/admin";
import Vote from "@/scenes/vote";
import ElectionList from "@/scenes/ElectionDashboard";

const Home = () => {
  const [role, setRole] = useState(2);
  const [web3, setWeb3] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ElectionID, setElectionId] = useState(0);
  const [ElectionListD, setElectionListD] = useState(true); // Controls visibility of ElectionList

  const handleSetElectionId = (id) => {
    setElectionListD(false); // Hide the election list when an election is selected
    setElectionId(id); // Set the current election ID
  };
  

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ElectionContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ElectionContract.abi,
        deployedNetwork && deployedNetwork.address
      );
      setWeb3(web3);
      setCurrentAccount(accounts[0]);
      setContract(instance);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing Web3:", error);
    }
  };

  const getRole = async () => {
    if (contract) {
      const userRole = await contract.methods.getRole(ElectionID, currentAccount).call();
      setRole(parseInt(userRole));
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  useEffect(() => {
    if (contract && currentAccount) {
      getRole();
    }
  }, [contract, ElectionID, currentAccount]);

  // Toggles the display of ElectionList
  const toggleElectionList = () => {
    setElectionListD(!ElectionListD);
  };

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        height: "100vh",
      }}
    >
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
          <Button onClick={toggleElectionList}>
            {ElectionListD ? "Hide Election List" : "Show Election List"}
          </Button>

          {ElectionListD ? (
            <ElectionList
              contract={contract}
              currentAccount={currentAccount}
              setElectionId={handleSetElectionId}
            />
          ) : (
            <Box>
              {role === 1 && (
                <Admin
                  contract={contract}
                  web3={web3}
                  currentAccount={currentAccount}
                  ElectionID={ElectionID}
                />
              )}

              {role === 2 && (
                <Vote
                  contract={contract}
                  web3={web3}
                  currentAccount={currentAccount}
                  ElectionID={ElectionID}
                />
              )}

              {role === 3 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh",
                  }}
                >
                  Access Denied
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default Home;
