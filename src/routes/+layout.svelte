<header class="header">
	<div class="container header-container">
		<div class="logo">
			<h1>Certificate Manager</h1>
		</div>
		<nav>
			<ul>
				<li><a href="/">Home</a></li>
				<li><a href="/create">Create Certificate</a></li>
				<li><a href="/list">List Certificates</a></li>
			</ul>
		</nav>
	</div>
</header>

<main>
    <slot />
</main>

<footer>
	<p>&copy; 2025 Certificate Manager. All rights reserved.</p>
</footer>

<style>
	header {
		background-color: #4caf50;
		color: white;
		padding: 10px 20px;
		text-align: center;
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

	label,
	select {
		margin: 10px;
	}

	main {
		padding: 20px;
	}
</style>
