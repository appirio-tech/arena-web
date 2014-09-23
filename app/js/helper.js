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
 * Changes in version 1.5 (Module Assembly - Web Arena UI - Chat Widget):
 * - Added chat-related events and constants.
 *
 * Changes in version 1.6 (Module Assembly - Web Arena UI - Challenge Phase):
 * - Added challenge phase related events.
 * - Added state names.
 *
 * Changes in version 1.7 (Module Assembly - Web Arena UI - System Tests):
 * - Added SingleBroadcastResponse to event name constants.
 * - Added PhaseChange to pop up titles.
 *
 * Changes in version 1.8 (Module Assembly - Web Arena UI - Phase I Bug Fix):
 * - Updated PHASE_NAME for System Test.
 *
 * Changes in version 1.9 (Module Assembly - Web Arena UI - Division Summary):
 * - Added CloseDivSummaryRequest and DivSummaryRequest.
 * - Added LANGUAGE_NAME, VIEW_ID, DIVSUMMARYREQUEST_TIMEGAP constants.
 *
 * Changes in version 1.10 (Module Assembly - Web Arena UI - Phase I Bug Fix 2):
 * - Added language list
 *
 * Changes in version 1.11 (Module Assembly - Web Arena UI - Phase I Bug Fix 3):
 * - Added coder history event names.
 * - Updated for re-connect logic.
 *
 * Changes in version 1.12 (Module Assembly - Web Arena UI - Notifications):
 * - Added GetAdminBroadcastsRequest, GetAdminBroadcastResponse, ImportantMessageResponse,
 *   ImportantMessageResponse, ReadMessageRequest events.
 * - Added BROADCAST_TYPE_NAME, DATE_NOTIFICATION_FORMAT, NOTIFICATION_TITLES, PHASE_DATA constants
 *   to handle notifications.
 *
 * Changes in version 1.13 (Module Assembly - Web Arena UI - Phase I Bug Fix 4):
 * - Added SetLanguageRequest event name and updated messages.
 *
 * Changes in version 1.14 (Module Assembly - Web Arena UI - Challenges and Challengers):
 * - Added ChallengesListResponse / ChallengeResponse event names.
 *
 * Changes in version 1.15 (Module Assembly - Web Arena UI - Test Panel Update for Batch Testing):
 * - Added BatchTestRequest and BatchTestResponse event name.
 *
 * Changes in version 1.16 (Module Assembly - Dashboard - Active Users and Leaderboard Panel):
 * - Added the create user list response type.
 * - Added ActiveUsersRequest event name and CreateLeaderBoardResponse event name.
 *
 * Changes in version 1.17 (Module Assembly - Web Arena - Local Chat Persistence):
 * - Added local storage constants.
 *
 * @author tangzx, amethystlei, dexy, ananthhh, flytoj2ee, TCASSEMBLER
 * @version 1.17
 */

module.exports = {
    // Represents the state names
    STATE_NAME: {
        User: 'user',
        Dashboard: 'user.dashboard',
        Coding: 'user.coding',
        ViewCode: 'user.viewCode',
        Contest: 'user.contest',
        ContestSummary: 'user.contestSummary',
        Logout: 'user.logout',
        Anonymous: 'anon',
        AnonymousHome: 'anon.home',
        LoggingIn: 'loggingin'
    },

    // Represents the event names
    EVENT_NAME: {
        // backend requests
        ChallengeRequest: 'ChallengeRequest',
        ChatRequest: 'ChatRequest',
        CloseProblemRequest: 'CloseProblemRequest',
        CloseDivSummaryRequest: 'CloseDivSummaryRequest',
        CoderInfoRequest: 'CoderInfoRequest',
        CompileRequest: 'CompileRequest',
        EnterRequest: 'EnterRequest',
        EnterRoundRequest: 'EnterRoundRequest',
        GenericPopupRequest: 'GenericPopupRequest',
        GetAdminBroadcastsRequest: 'GetAdminBroadcastsRequest',
        GetChallengeProblemRequest: 'GetChallengeProblemRequest',
        KeepAliveRequest: 'KeepAliveRequest',
        LogoutRequest: 'LogoutRequest',
        MoveRequest: 'MoveRequest',
        OpenComponentForCodingRequest: 'OpenComponentForCodingRequest',
        DivSummaryRequest: 'DivSummaryRequest',
        ReadMessageRequest: 'ReadMessageRequest',
        RegisterInfoRequest: 'RegisterInfoRequest',
        RegisterRequest: 'RegisterRequest',
        RegisterUsersRequest: 'RegisterUsersRequest',
        SSOLoginRequest: 'SSOLoginRequest',
        SubmitRequest: 'SubmitRequest',
        SynchTimeRequest: 'SynchTimeRequest',
        TestInfoRequest: 'TestInfoRequest',
        TestRequest: 'TestRequest',
        BatchTestRequest: 'BatchTestRequest',
        BatchTestResponse: 'BatchTestResponse',
        SetLanguageRequest: 'SetLanguageRequest',
        // backend responses
        CreateChallengeTableResponse: 'CreateChallengeTableResponse',
        CreateMenuResponse: 'CreateMenuResponse',
        CreateProblemsResponse: 'CreateProblemsResponse',
        CreateRoomListResponse: 'CreateRoomListResponse',
        CreateRoundListResponse: 'CreateRoundListResponse',
        CreateUserListResponse: 'CreateUserListResponse',
        EnableRoundResponse: 'EnableRoundResponse',
        EndSyncResponse: 'EndSyncResponse',
        ForcedLogoutResponse: 'ForcedLogoutResponse',
        GetAdminBroadcastResponse: 'GetAdminBroadcastResponse',
        GetProblemResponse: 'GetProblemResponse',
        ImportantMessageResponse: 'ImportantMessageResponse',
        KeepAliveInitializationDataResponse: 'KeepAliveInitializationDataResponse',
        KeepAliveResponse: 'KeepAliveResponse',
        LoginResponse: 'LoginResponse',
        OpenComponentResponse: 'OpenComponentResponse',
        PhaseDataResponse: 'PhaseDataResponse',
        PopUpGenericResponse: 'PopUpGenericResponse',
        RegisteredUsersResponse: 'RegisteredUsersResponse',
        RoomInfoResponse: 'RoomInfoResponse',
        RoundScheduleResponse: 'RoundScheduleResponse',
        SingleBroadcastResponse: 'SingleBroadcastResponse',
        StartSyncResponse: 'StartSyncResponse',
        SubmitResultsResponse: 'SubmitResultsResponse',
        SynchTimeResponse: 'SynchTimeResponse',
        SystestProgressResponse: 'SystestProgressResponse',
        TestInfoResponse: 'TestInfoResponse',
        UpdateChatResponse: 'UpdateChatResponse',
        UpdateCoderComponentResponse: 'UpdateCoderComponentResponse',
        UpdateCoderPointsResponse: 'UpdateCoderPointsResponse',
        UpdateLeaderBoardResponse: 'UpdateLeaderBoardResponse',
        UpdateUserListResponse: 'UpdateUserListResponse',
        UpdateRoundListResponse: 'UpdateRoundListResponse',
        UserInfoResponse: 'UserInfoResponse',
        CoderHistoryRequest: 'CoderHistoryRequest',
        CoderHistoryResponse: 'CoderHistoryResponse',
        ChallengesListResponse: 'ChallengesListResponse',
        ChallengeResponse: 'ChallengeResponse',
        ActiveUsersRequest: 'ActiveUsersRequest',
        CreateLeaderBoardResponse: 'CreateLeaderBoardResponse',
        // internal events
        Connected: 'Connected',
        Disconnected: 'Disconnected',
        // socket events
        SocketConnected: 'connect',
        SocketConnectionFailed: 'connect_failed',
        SocketDisconnected: 'disconnect',
        SocketReconnect: 'reconnect',
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
        'System Test Phase',
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
    // Represents the language name.
    LANGUAGE_NAME: {
        '0': 'Default',
        '1': 'Java',
        '2': 'Default',
        '3': 'Cpp',
        '4': 'Csharp',
        '5': 'VB',
        '6': 'Python'
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
    // maximum characters of a message can be sent in chat rooms.
    MAX_CHAT_LENGTH: 256,
    // Time gap between two leaderboad table rebuildings
    LEADERBOARD_TABLE_REBUILT_TIMEGAP: 3000,

    // pop up titles
    POP_UP_TITLES: {
        Error: 'Error.',
        CompileResult: 'Compile Result',
        TestResults: 'Test Results',
        CoderInfo: 'Coder Info',
        IncorrectUsage: 'Incorrect Usage',
        MultipleSubmission: 'Multiple Submission',
        Unauthorized: 'Unauthorized',
        ChallengeResults: 'Challenge Results',
        PhaseChange: 'Phase Change',
        Disconnected: 'Disconnected',
        ForcedLogout: 'Client Connection Error',
        NotAssigned: 'Not Assigned'
    },

    // custom pop up messages
    POP_UP_MESSAGES: {
        Reconnecting: "Waiting to reconnect...\nPress Close to logout and go to the login screen.",
        ForcedLogout: 'Logging off as you logged in to another session or browser.',
        LostConnection: 'The connection to the server has been lost. Please log off and log in again.',
        NotAssigned: 'You are not assigned to this room'
    },

    // The mapper from time zone code (must be uppercase) to offset from UTC (in minutes).
    // NOTE: List should be extended, here is the list: https://en.wikipedia.org/wiki/List_of_time_zone_abbreviations
    TIME_ZONES: {
        "EDT": -4 * 60,
        "EST": -5 * 60 // for North America, not Australia
    },

    // Menu type ID for chat rooms
    MENU_TYPE_ID: {
        LobbyMenu: 3
    },

    // Room type ID for chat rooms
    ROOM_TYPE_ID: {
        CoderRoom: 2,
        LobbyRoom: 3,
        AdminRoom: 12
    },

    // User list type
    USER_LIST: {
        RoomUsers: 0
    },

    // User list update action
    USER_LIST_UPDATE: {
        Add: 0,
        Remove: 1
    },

    // Chat types
    CHAT_TYPES: {
        UserChat: 0,
        SystemChat: 1,
        EmphSystemChat: 2,
        IrcChat: 3,
        ModeratedChatQuestionChat: 4,
        ModeratedChatSpeakerChat: 5,
        WhisperToYouChat: 6
    },

    // Chat scopes
    CHAT_SCOPES: {
        GlobalChatScope: 1,
        TeamChatScope: 2
    },

    // Compile results
    COMPILE_RESULTS_TYPE_ID: {
        FAILED: 0,
        SUCCEEDED: 1
    },

    // Mapping from view name to its id.
    VIEW_ID: {
        'room': -1,
        'divOne': 1,
        'divTwo': 2
    },

    // The timeout between two consecutive CloseDivSummaryRequest and DivSummaryRequest.
    DIVSUMMARYREQUEST_TIMEGAP: 100,

    // Types of the broadcasts
    BROADCAST_TYPE_NAME: {
        '0': 'general',
        '1': 'round',
        '2': 'problem'
    },

    // Date format used in notifications
    DATE_NOTIFICATION_FORMAT: 'MM/dd/yy h:mm a',

    // Pop-up titles used for notification details
    NOTIFICATION_TITLES: {
        'general': 'Admin Broadcast',
        'round': 'Round Broadcast',
        'problem': 'Problem Broadcast'
    },

    // Content of the phase date change messages to determine the cut and extract the round name
    PHASE_DATA: {
        START_MESSAGE: 'is starting for ',
        END_MESSAGE: 'is ending for '
    },

    // The survey question types.
    QUESTION_TYPE: {
        SINGLE_CHOICE: 1,
        MULTI_CHOICE: 2,
        LONG_TEXT: 3,
        SHORT_TEXT: 4
    },

    // The create user list response type.
    CREATE_USER_LIST_RESPONSE_TYPE: {
        ROOM_USERS: 0,
        ACTIVE_USERS: 2
    },

    // The local storage prefix and room list key
    LOCAL_STORAGE: {
        PREFIX: 'chat_history_',
        ROOM_LIST: 'chat_history_room_list'
    }
};
