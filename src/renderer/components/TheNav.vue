<template lang="pug">
	#appbar
		.title {{title}}
</template>

<script>
export default {
	props: {
		title: String
	}
}
</script>

<style lang="less" scoped>
#appbar {
	display: flex;
	align-items: center;
	height: var(--appbar-height);
	background: skyblue;
	width: 100%;
	.title {
		padding-left: 1rem;
		color: white;
	}
}
</style>
