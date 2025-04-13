<script>
	const defaultCertificateData = {
		commonName: '',
		organization: '',
		organizationId: '',
		country: '',
		caId: 1, // Default CA ID
		tppRoles: [] // Added TPP Roles
	};

	let certificateData = { ...defaultCertificateData }; // Initialize with default values

	const tppRolesOptions = [
		{ value: 'PSP_AS', label: 'PSP_AS: Account Servicing' },
		{ value: 'PSP_PI', label: 'PSP_PI: Payment Initiation' },
		{ value: 'PSP_AI', label: 'PSP_AI: Account Information' },
		{ value: 'PSP_IC', label: 'PSP_IC: Issuing of card-based payment instruments' }
	];

	let cas = [
		{id: 1, name: 'CA1'}, 
		{id: 2, name: 'CA2'}
	];

	async function fetchCas() {
		try {
			const response = await fetch('/api/cas');
			if (!response.ok) {
				throw new Error('Failed to fetch cas');
			}
			const data = await response.json();
			cas = data;
		} catch (error) {
			console.error('Error fetching cas:', error);
		}
	}	

	function handleCheckboxChange(event) {
		const { value, checked } = event.target;
		if (checked) {
			certificateData.tppRoles = [...certificateData.tppRoles, value];
		} else {
			certificateData.tppRoles = certificateData.tppRoles.filter((role) => role !== value);
		}
	}

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

			// Convert the response to Blob
			const blob = await response.blob();
			// Create a URL for the Blob
			const url = window.URL.createObjectURL(blob);
			// Create a temporary link element to trigger the download
			const a = document.createElement('a');
			a.href = url;
			a.download = 'qwac-certificate.p12'; // Set the desired file name
			document.body.appendChild(a);
			a.click(); // Programmatically click the link to trigger the download
			document.body.removeChild(a); // Clean up the DOM
			window.URL.revokeObjectURL(url); // Release the Blob URL

			certificateData = { ...defaultCertificateData }; // Reset the form data to default values

			// Optionally, you can show a success message or redirect the user
			// For example, you can use an alert or a toast notification
			alert('QWAC Certificate created successfully!\n\nYou can find it in the Download folder.'); // Show success message

			console.log('Certificate created successfully:');
		} catch (error) {
			console.error('Error creating certificate:', error);
		}
	}
</script>

<main>
	<h1>Create Certificate</h1>

	<form on:submit|preventDefault={handleCreateCertificate}>
		<div class="form-group">
			<label for="commonName">Common Name:</label>
			<input id="commonName" bind:value={certificateData.commonName} required />
		</div>
		<div class="form-group">
			<label for="organization">Organization:</label>
			<input id="organization" bind:value={certificateData.organization} required />
		</div>
		<div class="form-group">
			<label for="organizationId">Organization Identifier:</label>
			<input id="organizationId" bind:value={certificateData.organizationId} required />
		</div>
		<div class="form-group">
			<label for="country">Country:</label>
			<input id="country" bind:value={certificateData.country} required />
		</div>
		<div class="form-group">
			<label for="ca-select">Select Certificate Authority:</label>
			<select id="ca-select" bind:value={certificateData.caId}>
				{#each cas as ca}
					<option value={ca.id} selected={ca.id === 1}>{ca.name}</option>
				{/each}
			</select>
		</div>
		<div class="form-group">
			<label>TPP Roles:</label>
			{#each tppRolesOptions as role}
				<div class="checkbox-container">
					<label>
						<input
							type="checkbox"
							bind:group={certificateData.tppRoles}
							value={role.value}
						/>
						{role.label}
					</label>
				</div>
			{/each}
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

	.form-group {
		display: flex;
		flex-direction: column;
		margin-bottom: 15px;
	}

	form label {
		display: block;
		margin-bottom: 5px;
		font-weight: bold;
	}

	form input[type='text'] {
		width: calc(100% - 22px); /* Adjust width to align with checkbox */
		padding: 8px;
		box-sizing: border-box;
	}

	.checkbox-container {
		display: flex;
		align-items: center;
	}

	.checkbox-container input[type='checkbox'] {
		width: auto;
		margin-right: 10px;
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
