//@ts-nocheck
import { Button, Container } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { secret } from '../secrets';

function MainComponent() {
	let tokenClient: {
		callback: (response: any) => Promise<void>;
		requestAccessToken: (arg0: { prompt: string }) => void;
	};
	const [accessToken, setAccessToken] = useState(null);
	let pickerInited = false;
	let gisInited = false;
	const [docs, setDocs] = useState([]);
	useEffect(() => {
		const script = document.createElement('script');
		const script2 = document.createElement('script');

		script.src = 'https://apis.google.com/js/api.js';
		script2.src = 'https://accounts.google.com/gsi/client';
		script.onload = () => {
			gapiLoaded();
		};
		script2.onload = () => {
			gisLoaded();
		};
		script.async = true;
		script2.async = true;

		document.body.appendChild(script);
		document.body.appendChild(script2);
		return () => {
			document.body.removeChild(script);
			document.body.removeChild(script2);
		};
	}, []);

	const gapiLoaded = () => {
		//@ts-ignore
		window.gapi.load('picker', initializePicker);
	};
	function initializePicker() {
		pickerInited = true;
	}

	function gisLoaded() {
		//@ts-ignore
		tokenClient = window.google.accounts.oauth2.initTokenClient({
			client_id: secret.clientId,
			scope: secret.scopes,
			callback: '' // defined later
		});
		gisInited = true;
	}

	function handleAuthClick() {
		tokenClient.callback = async (response) => {
			if (response.error !== undefined) {
				throw response;
			}
			setAccessToken(response.access_token);

			// await createPicker();
		};

		if (accessToken === null) {
			// Prompt the user to select a Google Account and ask for consent to share their data
			// when establishing a new session.
			tokenClient.requestAccessToken({ prompt: 'consent' });
		} else {
			// Skip display of account chooser and consent dialog for an existing session.
			tokenClient.requestAccessToken({ prompt: '' });
		}
	}

	function createPicker() {
		const view = new window.google.picker.View(
			window.google.picker.ViewId.DOCS
		);

		const picker = new window.google.picker.PickerBuilder()
			.enableFeature(window.google.picker.Feature.NAV_HIDDEN)
			.enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
			.setDeveloperKey(secret.apiKey)
			.setAppId(secret.projectNumber)
			.setOAuthToken(accessToken)
			.addView(view)
			.addView(new window.google.picker.DocsUploadView())
			.setCallback(pickerCallback)
			.build();
		picker.setVisible(true);
	}

	function pickerCallback(data) {
		if (data.action === google.picker.Action.PICKED) {
			console.log(data.docs);

			setDocs(data.docs);
		}
	}

	return (
		<div>
			<Button variant="contained" onClick={handleAuthClick}>
				Connect to Google Drive
			</Button>
			<Button
				style={{ margin: '20px' }}
				variant="contained"
				disabled={accessToken === null}
				onClick={createPicker}
			>
				Select a file
			</Button>
			<h3 style={{ textAlign: 'center' }}>Selected files...</h3>
			<Container
				style={{
					maxWidth: '30%',
					minHeight: '200px',
					border: '1px solid black'
				}}
			>
				<ul style={{ listStyle: 'none' }}>
					{docs.map((doc) => (
						<li key={doc.id} style={{ textAlign: 'left' }}>
							{doc.name}
						</li>
					))}
				</ul>
			</Container>
		</div>
	);
}

export default MainComponent;
