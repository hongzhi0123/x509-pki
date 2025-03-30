<script>
	import { onMount } from 'svelte';
	import CertificateDetail from './CertificateDetail.svelte';

	let certificates = $state([]);
	let selectedCertificate = $state(null);
	let sortColumn = $state('');
	let sortDirection = $state('asc');

	async function fetchCertificates() {
		try {
			const response = await fetch('/api/certificates');
			if (!response.ok) {
				throw new Error('Failed to fetch certificates');
			}
			const data = await response.json();
			certificates = data;
		} catch (error) {
			console.error('Error fetching certificates:', error);
		}
	}

	onMount(() => {
		fetchCertificates();
	}); 

	function sortCertificates() {
		if (sortColumn) {
			certificates.sort((a, b) => {
				if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
				if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
				return 0;
			});
		}
	}

	function handleSort(column) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		sortCertificates();
	}

	function handleRevokeCertificate(id) {
		console.log(`Revoking certificate ID: ${id}`);
		// Add logic to revoke the certificate
	}

	function handleShowDetails(certificate) {
		console.log(certificate);
		selectedCertificate = certificate;
	}

	function handleCloseDetails() {
		selectedCertificate = null;
	}
</script>

<main>
	<h1>List of Certificates</h1>

	<table>
		<thead>
			<tr>
				<th class="sortable" onclick={() => handleSort('id')}>
					ID
					{#if sortColumn === 'id'}
						<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
					{/if}
				</th>
				<th class="sortable" onclick={() => handleSort('commonName')}>
					Common Name
					{#if sortColumn === 'commonName'}
						<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
					{/if}
				</th>
				<th class="sortable" onclick={() => handleSort('organization')}>
					Organization
					{#if sortColumn === 'organization'}
						<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
					{/if}
				</th>
				<th class="sortable" onclick={() => handleSort('organizationId')}>
					Organization ID
					{#if sortColumn === 'organizationId'}
						<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
					{/if}
				</th>
				<th class="sortable" onclick={() => handleSort('country')}>
					Country
					{#if sortColumn === 'country'}
						<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
					{/if}
				</th>
				<th class="sortable" onclick={() => handleSort('status')}>
					Status
					{#if sortColumn === 'status'}
						<span class="sort-indicator">{sortDirection === 'asc' ? '▲' : '▼'}</span>
					{/if}
				</th>
				<th>Actions</th>
			</tr>
		</thead>
		<tbody>
			{#each certificates as certificate}
				<tr>
					<td>{certificate.id}</td>
					<td>{certificate.commonName}</td>
					<td>{certificate.organization}</td>
					<td>{certificate.organizationId}</td>
					<td>{certificate.country}</td>
					<td>{certificate.status}</td>
					<td>
						<button class="revoke-button" onclick={() => handleRevokeCertificate(certificate.id)}
							>Revoke</button
						>
						<button class="details-button" onclick={() => handleShowDetails(certificate)}
							>Details</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>

	{#if selectedCertificate}
		<div class="overlay">
			<CertificateDetail {selectedCertificate} on:close={handleCloseDetails} />
		</div>
	{/if}
</main>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 20px 0;
	}

	table,
	th,
	td {
		border: 1px solid #ddd;
	}

	th,
	td {
		padding: 10px;
		text-align: left;
	}

	th {
		background-color: #f2f2f2;
		cursor: pointer;
	}

	th.sortable:hover {
		background-color: #ddd;
	}

	.sort-indicator {
		margin-left: 5px;
	}

	button {
		padding: 5px 10px;
		margin-right: 5px;
		border: none;
		border-radius: 3px;
		cursor: pointer;
	}

	.revoke-button {
		background-color: #e74c3c;
		color: white;
	}

	.details-button {
		background-color: #3498db;
		color: white;
	}

	button:hover {
		opacity: 0.8;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
