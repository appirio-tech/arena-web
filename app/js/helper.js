/*
 * Copyright (C) 2014 TopCoder Inc., All Rights Reserved.
 */
/**
 * This module contains constants.
 *
 * Changes in version 1.1 (Module Assembly - Web Arena UI - Contest Phase Movement):
 * - Added PhaseDataResponse, SystestProgressResponse, RegisterUsersRequest and RegisteredUsersResponse to events.
 *
 * @author TCSASSEMBLER
 * @version 1.1
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
        RegisteredUsersResponse: 'RegisteredUsersResponse'
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
    }
};
