/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This module contains constants.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Added PhaseDataResponse, SystestProgressResponse, RegisterUsersRequest and RegisteredUsersResponse to events.
 *
 * Changes in version 1.2 (Module Assembly - Web Arena UI - Coding IDE Part 1):
 * - Added enter round, open, test, compile related events.
 *
 * Changes in version 1.3 (Module Assembly - Web Arena UI - Coding IDE Part 2):
 * - Added problem submission and room summary update related events and ID's.
 *
 * @author tangzx, amethystlei
 * @version 1.3
 */

module.exports = {
    // Represents the event names
    EVENT_NAME: {
        LogoutRequest: 'LogoutRequest',
        SSOLoginRequest: 'SSOLoginRequest',
        LoginResponse: 'LoginResponse',
        UserInfoResponse: 'UserInfoResponse',
        StartSyncResponse: 'StartSyncResponse',
        CreateRoundListResponse: 'CreateRoundListResponse',
        RoundScheduleResponse: 'RoundScheduleResponse',
        KeepAliveInitializationDataResponse: 'KeepAliveInitializationDataResponse',
        KeepAliveResponse: 'KeepAliveResponse',
        KeepAliveRequest: 'KeepAliveRequest',
        SynchTimeResponse: 'SynchTimeResponse',
        EndSyncResponse: 'EndSyncResponse',
        CreateProblemsResponse: 'CreateProblemsResponse',
        UpdateRoundListResponse: 'UpdateRoundListResponse',
        EnableRoundResponse: 'EnableRoundResponse',
        RegisterInfoRequest: 'RegisterInfoRequest',
        PopUpGenericResponse: 'PopUpGenericResponse',
        RegisterRequest: 'RegisterRequest',
        EnterRoundRequest: 'EnterRoundRequest',
        RoomInfoResponse: 'RoomInfoResponse',
        EnterRequest: 'EnterRequest',
        MoveRequest: 'MoveRequest',
        CreateRoomListResponse: 'CreateRoomListResponse',
        PhaseDataResponse: 'PhaseDataResponse',
        SystestProgressResponse: 'SystestProgressResponse',
        RegisterUsersRequest: 'RegisterUsersRequest',
        RegisteredUsersResponse: 'RegisteredUsersResponse',
        OpenComponentForCodingRequest: 'OpenComponentForCodingRequest',
        GetProblemResponse: 'GetProblemResponse',
        OpenComponentResponse: 'OpenComponentResponse',
        CloseProblemRequest: 'CloseProblemRequest',
        CompileRequest: 'CompileRequest',
        TestInfoRequest: 'TestInfoRequest',
        TestInfoResponse: 'TestInfoResponse',
        TestRequest: 'TestRequest',
        SubmitRequest: 'SubmitRequest',
        SubmitResultsResponse: 'SubmitResultsResponse',
        GenericPopupRequest: 'GenericPopupRequest',
        UpdateLeaderBoardResponse: 'UpdateLeaderBoardResponse',
        UpdateCoderComponentResponse: 'UpdateCoderComponentResponse',
        UpdateCoderPointsResponse: 'UpdateCoderPointsResponse',
        CreateChallengeTableResponse: 'CreateChallengeTableResponse'
    },

    // Represents the phase names.
    PHASE_NAME: [
        'Inactive Phase',
        'Starts In Phase',
        'Registration Phase',
        'Almost Contest Phase',
        'Coding Phase',
        'Intermission Phase',
        'Challenge Phase',
        'Pending System Phase',
        'System Testing Phase',
        'Contest Complete Phase',
        'Voting Phase',
        'Tie Breaking Voting Phase',
        'Moderated Chatting Phase'
    ],

    // Represents the phase type id.
    PHASE_TYPE_ID: {
        InactivePhase: 0,
        StartsInPhase: 1,
        RegistrationPhase: 2,
        AlmostContestPhase: 3,
        CodingPhase: 4,
        IntermissionPhase: 5,
        ChallengePhase: 6,
        PendingSystemPhase: 7,
        SystemTestingPhase: 8,
        ContestCompletePhase: 9,
        VotingPhase: 10,
        TieBreakingVotingPhase: 11,
        ModeratedChattingPhase: 12
    },

    // Represents the coder problem status id.
    CODER_PROBLEM_STATUS_ID: {
        NOT_OPENED: 110,// Default
        REASSIGNED: 111,  //Team problem that has been assigned to another team member
        LOOKED_AT: 120,//Opened. Not yet compiled
        COMPILED_UNSUBMITTED: 121,// Compiled, but not yet submitted
        PASSED: 122,// Moving on without submitting
        NOT_CHALLENGED: 130,// Submitted
        CHALLENGE_FAILED: 131,
        CHALLENGE_SUCCEEDED: 140,
        SYSTEM_TEST_FAILED: 160,
        SYSTEM_TEST_SUCCEEDED: 150
    },

    // Represents the coder problem status name to show in the room/division summary.
    CODER_PROBLEM_STATUS_NAME: {
        '110': 'Unopened',
        '111': 'Re-Assigned',
        '120': 'Opened',
        '121': 'Compiled',
        '122': 'Compiled',
        '130': 'Submitted',
        '131': 'Pending',
        '140': 'Challenged',
        '160': 'Failed',
        '150': 'Passed'
    },

    // the timeout of request
    REQUEST_TIME_OUT: 10 * 1000,

    POP_UP_TITLES: {
        Error: 'Error.',
        CompileResult: 'Compile Result',
        TestResults: 'Test Results',
        MultipleSubmission: 'Multiple Submission',
        Unauthorized: 'Unauthorized'
    },

    // Compile results
    COMPILE_RESULTS_TYPE_ID: {
        FAILED: 0,
        SUCCEEDED: 1
    }
};
