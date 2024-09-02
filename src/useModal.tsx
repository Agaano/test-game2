import { useRef } from "react"

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
