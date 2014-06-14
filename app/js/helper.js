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
 * Changes in version 1.4 (Module Assembly - Web Arena UI Fix):
 * - Added ForcedLogoutResponse, Disconnected, Connected, SocketDisconnected, SocketConnected
 *   SocketConnectionFailed, SocketError, SynchTimeRequest to events.
 * - Added Disconnected to pop up titles.
 * - Added pop up messages and Reconnecting message.
 * - Reordered list of events in categories and alphabetically for easier overview.
 * - Added time zone mapper.
 * - Added REQUEST_TIME_OUT, SYNC_TIME_INTERVAL, CONNECTION_UPDATE_INTERVAL,
 *   INNACTIVITY_TIMEOUT constants.
 *
 * @author tangzx, amethystlei, dexy
 * @version 1.4
 */

module.exports = {
    // Represents the event names
    EVENT_NAME: {
        // backend requests
        CloseProblemRequest: 'CloseProblemRequest',
        CompileRequest: 'CompileRequest',
        EnterRequest: 'EnterRequest',
        EnterRoundRequest: 'EnterRoundRequest',
        GenericPopupRequest: 'GenericPopupRequest',
        KeepAliveRequest: 'KeepAliveRequest',
        LogoutRequest: 'LogoutRequest',
        MoveRequest: 'MoveRequest',
        OpenComponentForCodingRequest: 'OpenComponentForCodingRequest',
        RegisterInfoRequest: 'RegisterInfoRequest',
        RegisterRequest: 'RegisterRequest',
        RegisterUsersRequest: 'RegisterUsersRequest',
        SSOLoginRequest: 'SSOLoginRequest',
        SubmitRequest: 'SubmitRequest',
        SynchTimeRequest: 'SynchTimeRequest',
        TestInfoRequest: 'TestInfoRequest',
        TestRequest: 'TestRequest',
        // backend responses
        CreateChallengeTableResponse: 'CreateChallengeTableResponse',
        CreateProblemsResponse: 'CreateProblemsResponse',
        CreateRoomListResponse: 'CreateRoomListResponse',
        CreateRoundListResponse: 'CreateRoundListResponse',
        EnableRoundResponse: 'EnableRoundResponse',
        EndSyncResponse: 'EndSyncResponse',
        ForcedLogoutResponse: 'ForcedLogoutResponse',
        GetProblemResponse: 'GetProblemResponse',
        KeepAliveInitializationDataResponse: 'KeepAliveInitializationDataResponse',
        KeepAliveResponse: 'KeepAliveResponse',
        LoginResponse: 'LoginResponse',
        OpenComponentResponse: 'OpenComponentResponse',
        PhaseDataResponse: 'PhaseDataResponse',
        PopUpGenericResponse: 'PopUpGenericResponse',
        RegisteredUsersResponse: 'RegisteredUsersResponse',
        RoomInfoResponse: 'RoomInfoResponse',
        RoundScheduleResponse: 'RoundScheduleResponse',
        StartSyncResponse: 'StartSyncResponse',
        SubmitResultsResponse: 'SubmitResultsResponse',
        SynchTimeResponse: 'SynchTimeResponse',
        SystestProgressResponse: 'SystestProgressResponse',
        TestInfoResponse: 'TestInfoResponse',
        UpdateCoderComponentResponse: 'UpdateCoderComponentResponse',
        UpdateCoderPointsResponse: 'UpdateCoderPointsResponse',
        UpdateLeaderBoardResponse: 'UpdateLeaderBoardResponse',
        UpdateRoundListResponse: 'UpdateRoundListResponse',
        UserInfoResponse: 'UserInfoResponse',
        // internal events
        Connected: 'Connected',
        Disconnected: 'Disconnected',
        // socket events
        SocketConnected: 'connect',
        SocketConnectionFailed: 'connect_failed',
        SocketDisconnected: 'disconnect',
        SocketError: 'error'
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
    // the interval between two sync time requests
    SYNC_TIME_INTERVAL: 45 * 1000,
    // the interval between two connection checks
    CONNECTION_UPDATE_INTERVAL: 5 * 1000,
    // if server doesn't respond in this time interval (in ms) we will detect timeout
    INNACTIVITY_TIMEOUT: 90 * 1000,
    // default value for keep alive timeout
    KEEP_ALIVE_TIMEOUT: 30 * 1000,

    // pop up titles
    POP_UP_TITLES: {
        Error: 'Error.',
        CompileResult: 'Compile Result',
        TestResults: 'Test Results',
        MultipleSubmission: 'Multiple Submission',
        Unauthorized: 'Unauthorized',
        Disconnected: 'Disconnected',
        ForcedLogout: 'Client Connection Error'
    },

    // custom pop up messages
    POP_UP_MESSAGES: {
        Reconnecting: "Waiting to reconnect...\nPress Close to log out and go to the log in screen.",
        ForcedLogout: 'The connection to the server has been lost. Logging off.'
    },

    // The mapper from time zone code (must be uppercase) to offset from UTC (in minutes).
    // NOTE: List should be extended, here is the list: https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
    TIME_ZONES: {
        "EDT": -4 * 60,
        "EST": -5 * 60 // for North America, not Australia
    },

    // Compile results
    COMPILE_RESULTS_TYPE_ID: {
        FAILED: 0,
        SUCCEEDED: 1
    }
};
