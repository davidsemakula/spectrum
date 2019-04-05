// @flow

// queues
export const PROCESS_REPUTATION_EVENT = 'process reputation event';
export const CALCULATE_THREAD_SCORE = 'calculate thread score';

// reputation event types
export const THREAD_CREATED = 'thread created';
export const THREAD_DELETED = 'thread deleted';
export const THREAD_DELETED_BY_MODERATION = 'thread deleted by moderation';
export const MESSAGE_CREATED = 'message created';
export const MESSAGE_CREATED_POST_AUTHOR_BONUS =
  'message created post author bonus';
export const MESSAGE_DELETED = 'message deleted';
export const MESSAGE_DELETED_POST_AUTHOR_BONUS =
  'message deleted post author bonus';
export const REACTION_CREATED = 'reaction created';
export const REACTION_CREATED_POST_AUTHOR_BONUS =
  'reaction created post author bonus';
export const REACTION_DELETED = 'reaction deleted';
export const REACTION_DELETED_POST_AUTHOR_BONUS =
  'reaction deleted post author bonus';

export const THREAD_REACTION_CREATED = 'thread reaction created';
export const THREAD_REACTION_DELETED = 'thread reaction deleted';

// Keyy reputation event types
export const PROFILE_COMPLETED = 'profile completed';

export const THREADS_CREATED_1 = 'threads created 1';
export const THREADS_CREATED_5 = 'threads created 5';
export const THREADS_CREATED_10 = 'threads created 10';

export const MESSAGES_CREATED_1 = 'messages created 1';
export const MESSAGES_CREATED_5 = 'messages created 5';
export const MESSAGES_CREATED_10 = 'messages created 10';

export const REACTIONS_CREATED_1 = 'reactions created 1';
export const REACTIONS_CREATED_5 = 'reactions created 5';
export const REACTIONS_CREATED_10 = 'reactions created 10';

export const COMMUNITY_CREATED = 'community created';
export const COMMUNITIES_CREATED_1 = 'communities created 1';
export const COMMUNITIES_CREATED_2 = 'communities created 2';

export const USER_JOINED_COMMUNITY = 'user joined community';
export const COMMUNITIES_JOINED_1 = 'communities joined 1';
export const COMMUNITIES_JOINED_2 = 'communities joined 2';
export const COMMUNITIES_JOINED_3 = 'communities joined 3';
export const COMMUNITIES_JOINED_4 = 'communities joined 4';

export const COMMUNITY_MEMBERS_2 = 'community members 2';
export const COMMUNITY_MEMBERS_5 = 'community members 5';
export const COMMUNITY_MEMBERS_10 = 'community members 10';
export const COMMUNITY_MEMBERS_20 = 'community members 20';

// scores
export const THREAD_CREATED_SCORE = 20;
export const THREAD_DELETED_SCORE = -20;
export const THREAD_DELETED_BY_MODERATION_SCORE = 20;
export const MESSAGE_CREATED_SCORE = 2;
export const MESSAGE_CREATED_POST_AUTHOR_SCORE = 2;
export const MESSAGE_DELETED_POST_AUTHOR_SCORE = -2;
// occurs when a post is deleted - we treat each child message as being deleted
export const MESSAGE_DELETED_SCORE = -2;
export const REACTION_CREATED_SCORE = 30;
export const REACTION_CREATED_POST_AUTHOR_SCORE = 2;
export const REACTION_DELETED_SCORE = -30;
export const REACTION_DELETED_POST_AUTHOR_SCORE = -2;
export const THREAD_REACTION_CREATED_SCORE = 2;
export const THREAD_REACTION_DELETED_SCORE = -2;

// Keyy scores
export const PROFILE_COMPLETED_SCORE = 500;

export const THREADS_CREATED_SCORE_1 = 50;
export const THREADS_CREATED_SCORE_5 = 100;
export const THREADS_CREATED_SCORE_10 = 150;

export const MESSAGES_CREATED_SCORE_1 = 50;
export const MESSAGES_CREATED_SCORE_5 = 100;
export const MESSAGES_CREATED_SCORE_10 = 150;

export const REACTIONS_CREATED_SCORE_1 = 50;
export const REACTIONS_CREATED_SCORE_5 = 100;
export const REACTIONS_CREATED_SCORE_10 = 150;

export const COMMUNITIES_CREATED_SCORE_1 = 100;
export const COMMUNITIES_CREATED_SCORE_2 = 200;

export const COMMUNITIES_JOINED_SCORE_1 = 100;
export const COMMUNITIES_JOINED_SCORE_2 = 200;
export const COMMUNITIES_JOINED_SCORE_3 = 50;
export const COMMUNITIES_JOINED_SCORE_4 = 100;

export const COMMUNITY_MEMBERS_SCORE_2 = 50;
export const COMMUNITY_MEMBERS_SCORE_5 = 100;
export const COMMUNITY_MEMBERS_SCORE_10 = 150;
export const COMMUNITY_MEMBERS_SCORE_20 = 200;
