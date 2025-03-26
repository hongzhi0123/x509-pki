<script>
	// import { get } from 'svelte/store';

	let certificateData = {
		commonName: '',
		organization: '',
		country: ''
	};

	async function handleCreateCertificate() {
		try {
			const response = await fetch('api/certificates', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(certificateData)
			});

			if (!response.ok) {
				throw new Error('Failed to create certificate');
			}

			const result = await response.json();
			console.log('Certificate created successfully:', result);
		} catch (error) {
			console.error('Error creating certificate:', error);
		}
	}
</script>

<main>
	<h1>Create Certificate</h1>

	<form on:submit|preventDefault={handleCreateCertificate}>
		<div>
			<label for="commonName">Common Name:</label>
			<input id="commonName" bind:value={certificateData.commonName} required />
		</div>
		<div>
			<label for="organization">Organization:</label>
			<input id="organization" bind:value={certificateData.organization} required />
		</div>
		<div>
			<label for="country">Country:</label>
			<input id="country" bind:value={certificateData.country} required />
		</div>
		<button type="submit">Create</button>
	</form>
</main>

<style>
	form {
		max-width: 500px;
		margin: 0 auto;
		padding: 20px;
		border: 1px solid #ccc;
		border-radius: 10px;
		background-color: #f9f9f9;
	}

	form div {
		margin-bottom: 15px;
	}

	form label {
		display: block;
		margin-bottom: 5px;
		font-weight: bold;
	}

	form input {
		width: 100%;
		padding: 8px;
		box-sizing: border-box;
	}

	form button {
		width: 100%;
		padding: 10px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	form button:hover {
		background-color: #45a049;
	}
</style>
