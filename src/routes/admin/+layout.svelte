<header class="header">
	<div>
		<h2>Administration</h2>
		<nav>
			<ul>
				<li><a href="/admin/upload">Upload Certificates</a></li>
				<li><a href="/admin/download">Download Certificates</a></li>
			</ul>
		</nav>
	</div>
</header>

<main>
    <slot />
</main>

<style>
	header {
		background-color: #4caf50;
		color: white;
		padding: 10px 20px;
		text-align: center;
	}
	.upload-layout {
		border: 2px solid green;
		padding: 1rem;
		margin-top: 1rem;
	}

	nav ul {
		list-style-type: none;
		padding: 0;
	}

	nav ul li {
		display: inline;
		margin: 0 10px;
	}

	nav ul li a {
		color: white;
		text-decoration: none;
		font-weight: bold;
	}

	main {
		padding: 20px;
	}    
</style>
