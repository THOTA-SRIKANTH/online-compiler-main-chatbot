import { FaJs ,FaFileCode} from 'react-icons/fa';
import { SiTypescript, SiC, SiCplusplus, SiGo, SiKotlin, SiRust, SiPostgresql, SiYaml, SiDart } from 'react-icons/si';
import { FaPython, FaJava, FaPhp, FaHtml5, FaCss3Alt, FaSass, FaMarkdown, FaTerminal } from 'react-icons/fa';
import { DiRuby } from 'react-icons/di';
import { VscJson } from 'react-icons/vsc';

const extensionToIconComponent = {
  '.js': FaJs,
  '.ts': SiTypescript,
  '.py': FaPython,
  '.java': FaJava,
  '.c': SiC,
  '.cpp': SiCplusplus,
//   '.cs': SiCsharp,
  '.go': SiGo,
  '.rb': DiRuby,
  '.php': FaPhp,
  '.html': FaHtml5,
  '.css': FaCss3Alt,
  '.scss': FaSass,
  '.json': VscJson,
  '.md': FaMarkdown,
  '.kt': SiKotlin,
  '.swift': SiKotlin,
  '.rs': SiRust,
  '.sh': FaTerminal,
  '.sql': SiPostgresql,
  '.yml': SiYaml,
  '.yaml': SiYaml,
  '.dart': SiDart,
};

  const FileIcon = ({ extension }) => {
    const IconComponent = extensionToIconComponent[extension];
    return IconComponent ? <IconComponent /> : <FaFileCode />;
  };
  
    export default FileIcon;
  