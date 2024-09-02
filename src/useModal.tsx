import { useCallback, useRef, useState } from "react"

export function useModal() {
    const ref = useRef<HTMLDivElement | null>(null)
    
    return ({children, open, setOpen}: {children: React.ReactNode, open: boolean, setOpen: (value: boolean) => void}) => {
        if (!open) {
            return;
        } 

        return (
            <div className="modal" onClick = {(e:any) => {
                    if (!ref.current?.contains(e.target)) {
                        setOpen(false)
                    }
                }}>
                <div ref = {ref} className="modal-content">
                    {children}
                </div>
            </div>
        )
    }

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
