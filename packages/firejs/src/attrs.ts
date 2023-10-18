import isAttrHTML5Compliant from '@emotion/is-prop-valid'

const reservedProps = ['children']

export function shouldSkipProp(key: string) {
	return reservedProps.includes(key)
}

export function isPropValid(key: string) {
	return isAttrHTML5Compliant(key)
}

const eventListenerRegex = /on([A-Z]{0,1}[a-z]+)/gm

export function isEventListener(key: string) {
	return eventListenerRegex.test(key)
}

export function getEventListenerKey(key: string) {
	return key.match(eventListenerRegex)[0].toLowerCase()
}

const propMap = {
	className: 'class',
}

export function getPropAttr(key: string) {
	if (key in propMap) {
		return propMap[key]
	}

	if (isEventListener(key)) {
		return getEventListenerKey(key)
	}

	return key
}
