import {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';

export class AutoPost implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'AutoPost',
		name: 'autoPost',
		icon: 'file:autopost.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with AutoPost TheNextGen — schedule posts, manage DMs, reply to comments, and list accounts',
		defaults: {
			name: 'AutoPost',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'autoPostApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// ─── Resource ────────────────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Post', value: 'posts' },
					{ name: 'Message (DM)', value: 'messages' },
					{ name: 'Comment', value: 'comments' },
					{ name: 'Account', value: 'accounts' },
				],
				default: 'posts',
			},

			// ─── Operations: Posts ───────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['posts'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Schedule a new post',
						action: 'Create a post',
					},
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all posts',
						action: 'Get all posts',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a post by ID',
						action: 'Delete a post',
					},
				],
				default: 'create',
			},

			// ─── Operations: Messages ────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['messages'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all messages',
						action: 'Get all messages',
					},
					{
						name: 'Reply',
						value: 'reply',
						description: 'Reply to a direct message',
						action: 'Reply to a message',
					},
					{
						name: 'Mark as Read',
						value: 'markRead',
						description: 'Mark messages from a sender as read',
						action: 'Mark message as read',
					},
				],
				default: 'getAll',
			},

			// ─── Operations: Comments ────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['comments'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Retrieve all comments',
						action: 'Get all comments',
					},
					{
						name: 'Reply',
						value: 'reply',
						description: 'Reply to a comment',
						action: 'Reply to a comment',
					},
				],
				default: 'getAll',
			},

			// ─── Operations: Accounts ────────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['accounts'] } },
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'List all connected social accounts',
						action: 'Get all accounts',
					},
				],
				default: 'getAll',
			},

			// ═════════════════════════════════════════════════════════════════════════
			// POSTS fields
			// ═════════════════════════════════════════════════════════════════════════

			// Posts > Create
			{
				displayName: 'Content',
				name: 'content',
				type: 'string',
				typeOptions: { rows: 4 },
				default: '',
				required: true,
				description: 'The text content of the post',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},
			{
				displayName: 'Platforms',
				name: 'platforms',
				type: 'multiOptions',
				options: [
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'Twitter / X', value: 'twitter' },
				],
				default: [],
				required: true,
				description: 'Platforms to publish the post on',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},
			{
				displayName: 'Platform Notes',
				name: 'platformNotice',
				type: 'notice',
				default: 'Facebook & Instagram: supports text, image, video\nLinkedIn: supports text and image (video requires direct upload)\nTikTok: requires video file',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},
			{
				displayName: 'Account IDs',
				name: 'accountIds',
				type: 'string',
				default: '',
				description: 'Comma-separated account IDs to publish to. Get account IDs from the "Get all accounts" action. Leave empty to use the default account.',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},
			{
				displayName: 'Scheduling Tip',
				name: 'scheduledAtNotice',
				type: 'notice',
				default: '💡 Tip: Use n8n expression {{ $now.toISO() }} for current time, or {{ DateTime.fromISO(\'2026-03-29T16:00:00\', {zone: \'Asia/Baghdad\'}).toISO() }} for timezone-aware scheduling',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},
			{
				displayName: 'Scheduled At',
				name: 'scheduled_at',
				type: 'string',
				default: '',
				description: 'Schedule date and time in ISO 8601 format with timezone. Examples:\n- 2026-03-29T16:10:00+03:00 (Iraq time UTC+3)\n- 2026-03-29T13:10:00Z (UTC)\n- 2026-03-29T08:10:00-05:00 (New York time)\nUse n8n\'s $now.plus() or DateTime expressions to build this automatically. Leave empty to publish immediately.',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},
			{
				displayName: 'Media URL',
				name: 'mediaUrl',
				type: 'string',
				default: '',
				description: 'Public URL of an image (JPG, PNG) or video (MP4, MOV) to attach. For LinkedIn and TikTok, video URL must be publicly accessible.',
				displayOptions: { show: { resource: ['posts'], operation: ['create'] } },
			},

			// Posts > Get All
			{
				displayName: 'Status Filter',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Scheduled', value: 'scheduled' },
					{ name: 'Published', value: 'published' },
					{ name: 'Failed', value: 'failed' },
					{ name: 'Draft', value: 'draft' },
				],
				default: '',
				description: 'Filter posts by status',
				displayOptions: { show: { resource: ['posts'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 20,
				description: 'Max number of posts to return',
				displayOptions: { show: { resource: ['posts'], operation: ['getAll'] } },
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 1,
				description: 'Page number for pagination',
				displayOptions: { show: { resource: ['posts'], operation: ['getAll'] } },
			},

			// Posts > Delete
			{
				displayName: 'Post ID',
				name: 'postId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the post to delete',
				displayOptions: { show: { resource: ['posts'], operation: ['delete'] } },
			},

			// ═════════════════════════════════════════════════════════════════════════
			// MESSAGES fields
			// ═════════════════════════════════════════════════════════════════════════

			// Messages > Get All
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'Twitter / X', value: 'twitter' },
				],
				default: '',
				description: 'Filter messages by platform',
				displayOptions: { show: { resource: ['messages'], operation: ['getAll'] } },
			},
			{
				displayName: 'Is Read',
				name: 'is_read',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Read', value: 'true' },
					{ name: 'Unread', value: 'false' },
				],
				default: '',
				description: 'Filter messages by read status',
				displayOptions: { show: { resource: ['messages'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 20,
				description: 'Max number of messages to return',
				displayOptions: { show: { resource: ['messages'], operation: ['getAll'] } },
			},

			// Messages > Reply
			{
				displayName: 'Message ID',
				name: 'messageId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the message to reply to',
				displayOptions: { show: { resource: ['messages'], operation: ['reply'] } },
			},
			{
				displayName: 'Reply Text',
				name: 'replyText',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				required: true,
				description: 'The text of the reply',
				displayOptions: { show: { resource: ['messages'], operation: ['reply'] } },
			},

			// Messages > Mark as Read
			{
				displayName: 'Sender ID',
				name: 'senderId',
				type: 'string',
				default: '',
				required: true,
				description: 'The sender ID whose messages should be marked as read',
				displayOptions: { show: { resource: ['messages'], operation: ['markRead'] } },
			},
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'Twitter / X', value: 'twitter' },
				],
				default: 'instagram',
				required: true,
				description: 'The platform of the messages to mark as read',
				displayOptions: { show: { resource: ['messages'], operation: ['markRead'] } },
			},

			// ═════════════════════════════════════════════════════════════════════════
			// COMMENTS fields
			// ═════════════════════════════════════════════════════════════════════════

			// Comments > Get All
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'Twitter / X', value: 'twitter' },
				],
				default: '',
				description: 'Filter comments by platform',
				displayOptions: { show: { resource: ['comments'], operation: ['getAll'] } },
			},
			{
				displayName: 'Is Read',
				name: 'is_read',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Read', value: 'true' },
					{ name: 'Unread', value: 'false' },
				],
				default: '',
				description: 'Filter comments by read status',
				displayOptions: { show: { resource: ['comments'], operation: ['getAll'] } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 20,
				description: 'Max number of comments to return',
				displayOptions: { show: { resource: ['comments'], operation: ['getAll'] } },
			},

			// Comments > Reply
			{
				displayName: 'Comment ID',
				name: 'commentId',
				type: 'string',
				default: '',
				required: true,
				description: 'The ID of the comment to reply to',
				displayOptions: { show: { resource: ['comments'], operation: ['reply'] } },
			},
			{
				displayName: 'Reply Text',
				name: 'replyText',
				type: 'string',
				typeOptions: { rows: 3 },
				default: '',
				required: true,
				description: 'The text of the reply',
				displayOptions: { show: { resource: ['comments'], operation: ['reply'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('autoPostApi');

		const baseUrl = (credentials.baseUrl as string).replace(/\/$/, '');
		const apiKey = credentials.apiKey as string;

		const makeRequest = async (
			method: IHttpRequestMethods,
			endpoint: string,
			body?: IDataObject,
			qs?: IDataObject,
		) => {
			const options: IRequestOptions = {
				method,
				uri: `${baseUrl}/api/v1${endpoint}`,
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
				json: true,
				body,
				qs,
			};
			return this.helpers.request(options);
		};

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: unknown;

				// ── Posts ────────────────────────────────────────────────────────────
				if (resource === 'posts') {
					if (operation === 'create') {
						const content = this.getNodeParameter('content', i) as string;
						const platforms = this.getNodeParameter('platforms', i) as string[];
						const scheduled_at = this.getNodeParameter('scheduled_at', i, '') as string;
						const mediaUrl = this.getNodeParameter('mediaUrl', i, '') as string;
						const accountIdsRaw = this.getNodeParameter('accountIds', i, '') as string;

						const body: IDataObject = { content, platforms };
						if (scheduled_at) body.scheduled_at = scheduled_at;
						if (mediaUrl) body.image_url = mediaUrl;
						if (accountIdsRaw.trim()) {
							body.account_ids = accountIdsRaw
								.split(',')
								.map((s) => parseInt(s.trim(), 10))
								.filter((n) => !isNaN(n));
						}

						responseData = await makeRequest('POST', '/posts', body);
					} else if (operation === 'getAll') {
						const status = this.getNodeParameter('status', i, '') as string;
						const limit = this.getNodeParameter('limit', i, 20) as number;
						const page = this.getNodeParameter('page', i, 1) as number;

						const qs: IDataObject = { limit, page };
						if (status) qs.status = status;

						responseData = await makeRequest('GET', '/posts', undefined, qs);
					} else if (operation === 'delete') {
						const postId = this.getNodeParameter('postId', i) as string;
						responseData = await makeRequest('DELETE', `/posts/${postId}`);
					}
				}

				// ── Messages ─────────────────────────────────────────────────────────
				else if (resource === 'messages') {
					if (operation === 'getAll') {
						const platform = this.getNodeParameter('platform', i, '') as string;
						const is_read = this.getNodeParameter('is_read', i, '') as string;
						const limit = this.getNodeParameter('limit', i, 20) as number;

						const qs: IDataObject = { limit };
						if (platform) qs.platform = platform;
						if (is_read !== '') qs.is_read = is_read;

						responseData = await makeRequest('GET', '/inbox/messages', undefined, qs);
					} else if (operation === 'reply') {
						const messageId = this.getNodeParameter('messageId', i) as string;
						const replyText = this.getNodeParameter('replyText', i) as string;

						responseData = await makeRequest('POST', `/inbox/messages/${messageId}/reply`, {
							message: replyText,
						});
					} else if (operation === 'markRead') {
						const senderId = this.getNodeParameter('senderId', i) as string;
						const platform = this.getNodeParameter('platform', i) as string;

						responseData = await makeRequest('POST', '/inbox/messages/mark-read', {
							sender_id: senderId,
							platform,
						});
					}
				}

				// ── Comments ─────────────────────────────────────────────────────────
				else if (resource === 'comments') {
					if (operation === 'getAll') {
						const platform = this.getNodeParameter('platform', i, '') as string;
						const is_read = this.getNodeParameter('is_read', i, '') as string;
						const limit = this.getNodeParameter('limit', i, 20) as number;

						const qs: IDataObject = { limit };
						if (platform) qs.platform = platform;
						if (is_read !== '') qs.is_read = is_read;

						responseData = await makeRequest('GET', '/inbox/comments', undefined, qs);
					} else if (operation === 'reply') {
						const commentId = this.getNodeParameter('commentId', i) as string;
						const replyText = this.getNodeParameter('replyText', i) as string;

						responseData = await makeRequest('POST', `/inbox/comments/${commentId}/reply`, {
							message: replyText,
						});
					}
				}

				// ── Accounts ─────────────────────────────────────────────────────────
				else if (resource === 'accounts') {
					if (operation === 'getAll') {
						responseData = await makeRequest('GET', '/accounts');
					}
				}

				if (responseData === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported resource/operation: ${resource}/${operation}`,
						{ itemIndex: i },
					);
				}

				const rows = Array.isArray(responseData) ? responseData : [responseData];
				returnData.push(...rows.map((d) => ({ json: d as IDataObject })));
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
