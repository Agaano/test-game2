import { useRef, useState } from "react"

export function useModalAlert(): [
	() => React.ReactNode,
	(elem: React.ReactNode | string) => void
] {
	const [windows, setWindows] = useState<React.ReactNode[]>([])
	const ref = useRef<HTMLDivElement | null>(null)

	const call = (elemToPaste: React.ReactNode | string) => {
		setWindows(prev => [...prev, elemToPaste])
	}

	const windowsElement = () => {
		return (
			<>{windows.length > 0 &&
					windows.map((window, index) => {
						return (
						<main className='modal' onClick = {(e:any) => {
							if (!ref.current?.contains(e.target)) {
							setWindows(prev => removeByIndex(prev,index))
						}}}>
							<div ref = {ref} className='modal-content'>
								{window}
							</div>
						</main>
					)})
				}</>
		)
	}

	return [windowsElement, call]
}

function removeByIndex(array: Array<any>, index: number) {
	if (index < 0 || index >= array.length) {
		return array
	}

	const newArray = new Array(array.length - 1)
	for (let i = 0; i < index; i++) {
		newArray[i] = array[i]
	}
	for (let i = index + 1; i < array.length; i++) {
		newArray[i - 1] = array[i]
	}

	return newArray
}
