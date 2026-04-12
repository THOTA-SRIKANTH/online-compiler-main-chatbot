import MonacoEditor from 'react-monaco-editor';

const CodeEditor = ({props}) => {
  const {selectedFileContent,language,width,handleCodeChange} = props;
  const options = {
    selectOnLineNumbers: true,
    
  };

  return (
    <MonacoEditor
      height="86vh"
      width={width}
      language={language}
      theme="vs-dark"
      value={selectedFileContent}
      options={options}
      onChange={handleCodeChange}
    />
  );
};

export default CodeEditor;
