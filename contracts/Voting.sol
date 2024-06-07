// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;

contract Election {
    enum ElectionState {
        NotStarted,
        InProgress,
        Ended
    }

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
        string gender;
    }

    struct Voter {
        bool hasVoted;
        bool isAuthorized;
    }

    struct ElectionInstance {
        uint256 id;
        string name;
        ElectionState state;
        mapping(uint256 => Candidate) candidates;
        uint256 candidatesCount;
        mapping(address => Voter) voters;
        uint256 votersCount;
		uint256[] winningCandidateIds;

    }

    address public owner;
    uint256 public electionCount = 0;
    mapping(uint256 => ElectionInstance) public elections;

    constructor() {
        owner = msg.sender;
        createElection("Default Election");
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    event VoteCasted(uint256 indexed electionId, uint256 indexed candidateId);

	event ElectionEnded(string winnerName, uint256 voteCount);


    function createElection(string memory _name) public onlyOwner {
        ElectionInstance storage newElection = elections[electionCount];
        newElection.id = electionCount;
        newElection.name = _name;
        newElection.state = ElectionState.NotStarted;
        newElection.candidatesCount = 0;
        newElection.votersCount = 0;

        electionCount++;
    }

    function addCandidate(uint256 electionId, string memory _name, string memory _gender) public onlyOwner {
        require(elections[electionId].state == ElectionState.NotStarted, "Cannot add candidates after election started");

        ElectionInstance storage election = elections[electionId];
        uint256 candidateId = election.candidatesCount;
        election.candidates[candidateId] = Candidate(candidateId, _name, 0, _gender);
        election.candidatesCount++;
    }

    function addVoter(uint256 electionId, address _voter) public onlyOwner {
        require(elections[electionId].state == ElectionState.NotStarted, "Cannot add voters after election started");

        ElectionInstance storage election = elections[electionId];
        require(!election.voters[_voter].isAuthorized, "Voter already added");

        election.voters[_voter] = Voter(false, true);
        election.votersCount++;

    }

    function startElection(uint256 electionId) public onlyOwner {
        require(elections[electionId].state == ElectionState.NotStarted, "Election already started or ended");

        elections[electionId].state = ElectionState.InProgress;
    }

    function endElection(uint256 electionId) public onlyOwner {
        require(elections[electionId].state == ElectionState.InProgress, "Election not in progress");

        elections[electionId].state = ElectionState.Ended;
    }

	function declareWinner(uint256 electionId) public onlyOwner returns (string memory, uint256) {
    ElectionInstance storage election = elections[electionId];

    uint256 winningVoteCount = 0;
    delete election.winningCandidateIds; // Clear previous winners

    // Find winning candidate(s)
    for (uint256 i = 0; i < election.candidatesCount; i++) {
        if (election.candidates[i].voteCount > winningVoteCount) {
            winningVoteCount = election.candidates[i].voteCount;
            election.winningCandidateIds = [i]; // Reinitialize the winning candidate ID array
        } else if (election.candidates[i].voteCount == winningVoteCount) {
            election.winningCandidateIds.push(i); // Handle ties
        }
    }

    // Handle ties with randomness
    if (election.winningCandidateIds.length > 1) {
        bytes32 blockHash = blockhash(block.number - 1);
        // Use block hash for randomness
        uint256 randomIndex = uint256(keccak256(abi.encodePacked(blockHash))) % election.winningCandidateIds.length;
        election.winningCandidateIds = [election.winningCandidateIds[randomIndex]]; // Choose one winner
    }

    // Return the winner's name and winning vote count
    return (
        election.candidates[election.winningCandidateIds[0]].name,
        winningVoteCount
    );
}


    function vote(uint256 electionId, uint256 _candidateId) public {
        require(elections[electionId].state == ElectionState.InProgress, "Election is not in progress");
        ElectionInstance storage election = elections[electionId];

        require(election.voters[msg.sender].isAuthorized, "You are not an authorized voter");
        require(!election.voters[msg.sender].hasVoted, "You have already voted");
        require(_candidateId < election.candidatesCount, "Invalid candidate ID");

        election.candidates[_candidateId].voteCount++;
        election.voters[msg.sender].hasVoted = true;

        emit VoteCasted(electionId, _candidateId);
    }

    function getCandidateDetails(uint256 electionId, uint256 _candidateId)
        public
        view
        returns (string memory, uint256, string memory)
    {
        ElectionInstance storage election = elections[electionId];
        require(_candidateId < election.candidatesCount, "Invalid candidate ID");

        return (
            election.candidates[_candidateId].name,
            election.candidates[_candidateId].voteCount,
            election.candidates[_candidateId].gender
        );
    }


    function getRole(uint256 electionId, address _current) public view returns (uint256) {
        ElectionInstance storage election = elections[electionId];

        if (_current == owner) {
            return 1; // Owner
        } else if (election.voters[_current].isAuthorized) {
            return 2; // Voter
        } else {
            return 3; // Unauthorized
        }
    }

    // Retrieve details of all elections
    function getAllElections() public view returns (uint256[] memory, string[] memory, ElectionState[] memory) {
        uint256[] memory ids = new uint256[](electionCount);
        string[] memory names = new string[](electionCount);
        ElectionState[] memory states = new ElectionState[](electionCount);

        for (uint256 i = 0; i < electionCount; i++) {
            ids[i] = elections[i].id;
            names[i] = elections[i].name;
            states[i] = elections[i].state;
        }

        return (ids, names, states);
    }

    // Delete an election if it is in the 'Ended' state
    function deleteElection(uint256 electionId) public onlyOwner {
        require(elections[electionId].state == ElectionState.Ended, "Only ended elections can be deleted");
        delete elections[electionId];
    }

}