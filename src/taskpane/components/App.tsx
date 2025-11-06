import * as React from "react";
import { makeStyles } from "@fluentui/react-components";
import { MyRuntimeProvider } from "./MyRuntimeProvider";
import { Thread } from "../../assistantai_components/thread";
import ApiKeyInput from "./ApikeyGetter";
import { getFromLocalStorage } from '../../addin-storage';

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

const App: React.FC<AppProps> = (props: AppProps) => {
  console.log(`App component loaded with title: ${props.title}`);
  const [hasApiKey, setHasApiKey] = React.useState(false);

  React.useEffect(() => {
    const key = getFromLocalStorage("GOOGLE_AI_API_KEY");
    setHasApiKey(!!key);
  }, []);

  const handleKeySaved = () => {
    setHasApiKey(true);
  };

  return (
    <div>
      {hasApiKey ? (
        <MyRuntimeProvider>
          <Thread />
        </MyRuntimeProvider>
      ) : (
        <ApiKeyInput onSave={handleKeySaved} />
      )}
    </div>
  );
};

export default App;
