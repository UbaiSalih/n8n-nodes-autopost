import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AutoPostApi implements ICredentialType {
	name = 'autoPostApi';
	displayName = 'AutoPost API';
	documentationUrl = 'https://autopost.thenextgen.ai/docs/api';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your AutoPost API key (starts with up_). Get it from autopost.thenextgen.ai/settings/api',
			placeholder: 'up_xxxxxxxxxxxxxxxx',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://autopost.thenextgen.ai',
			required: true,
			description: 'Base URL for the AutoPost API',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/api/v1/accounts',
			method: 'GET',
		},
	};
}
