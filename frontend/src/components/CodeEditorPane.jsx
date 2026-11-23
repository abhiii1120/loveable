import { useEffect, useEffectEvent } from "react";
import { Editor } from "@monaco-editor/react";
import { languageForPath } from "@/shared/utils/fileTree";

export function CodeEditorPane({
  tabs,
  activePath,
  onSelect,
  onClose,
  onChange,
  onSave,
  isSaving,
}) {
    const activeTab = tabs.find((tab) => tab.path === activePath)
    const saveActive = useEffectEvent(() => {
        if(activePath) onSave(activeTab.path)
    })

    useEffect(() => {
        function handleKeyDown(event){
            if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's'){
                event.preventDefault()
                saveActive()
            }
        }

        window.addEventListener('keydown',handleKeyDown)
        return () => window.removeEventListener('keydown',handleKeyDown)
    },[])

    return (
        <section className="flex min-h-0 min-w-0 flex-col bg-primary">

        </section>
    )
}
