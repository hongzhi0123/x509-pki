<script>
	let certificateData = {
		commonName: '',
		organization: '',
		organizationId: '',
		country: '',
		tppRoles: [] // Added TPP Roles
	};

	const tppRolesOptions = [
		{ value: 'PSP_AS', label: 'PSP_AS: Account Servicing' },
		{ value: 'PSP_PI', label: 'PSP_PI: Payment Initiation' },
		{ value: 'PSP_AI', label: 'PSP_AI: Account Information' },
		{ value: 'PSP_IC', label: 'PSP_IC: Issuing of card-based payment instruments' }
	];

	let cas = [
		{id: 1, label: 'CA1'}, 
		{id: 2, label: 'CA2'}
	];

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
					<option value={ca.id} selected={ca.id === 1}>{ca.label}</option>
				{/each}
			</select>
		</div>
		<div class="form-group">
			<label>TPP Roles:</label>
			{#each tppRolesOptions as role}
				<div class="checkbox-container">
					<input
						type="checkbox"
						id={role.value}
						value={role.value}
						on:change={handleCheckboxChange}
					/>
					<label for={role.value}>{role.label}</label>
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
