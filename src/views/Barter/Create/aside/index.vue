<template>
	<v-aside>
		<menu class="box steps">
			<menuitem
				v-for="(step, key) in steps"
				:key="key"
			>
				<a :href="`#${ key }`">{{ step.text }}</a>
			</menuitem>
		</menu>
	</v-aside>
</template>

<style lang="sass" src="./index.sass"></style>
<script src="./index.js"></script>