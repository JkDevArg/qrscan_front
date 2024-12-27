import {
  Button,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { checkURL } from "@/services/api";
import { useState } from "react";
import * as Linking from "expo-linking";

let debounceTimeout: NodeJS.Timeout;

const ScanScreen: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState("off");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [urlToOpen, setUrlToOpen] = useState("");

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned) return;

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(async () => {
      setScanned(true);

      try {
        const response = await checkURL(data);
        if (response) {
          setUrlToOpen(data);
          setModalMessage("La URL es segura, ¿desea continuar?");
          setModalVisible(true);
        } else {
          setModalMessage("Esta URL es maliciosa!");
          setModalVisible(true);
        }
      } catch (error) {
        console.error("Error checking URL", error);
        setModalMessage("No se pudo verificar la URL.");
        setModalVisible(true);
      }
    }, 300);
  };

  const handleGithubPress = () => {
    // Acciones al presionar el botón de Github
    Linking.openURL("https://github.com/JkDevArg");
    console.log("Github button pressed");
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleYes = () => {
    Linking.openURL(urlToOpen);
    setModalVisible(false);
    setScanned(false);
  };

  const handleNo = () => {
    setModalVisible(false);
    setScanned(false);
  };

  return (
    <View style={styles.container}>
      {/* Cámara */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        type={facing}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={styles.githubButtonContainer}>
        <TouchableOpacity
          style={styles.githubButton}
          onPress={handleGithubPress}
        >
          <Text style={styles.githubText}>Github</Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.overlay}>
        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
      </View> */}

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <View style={styles.modalButtons}>
              <Button title="No" onPress={handleNo} />
              <Button title="Sí" onPress={handleYes} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 20,
  },
  overlay: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 250,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 5,
    padding: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalMessage: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
  githubButtonContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 300,
    alignItems: "center",
  },
  githubButton: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  githubText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScanScreen;
