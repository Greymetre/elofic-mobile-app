import { Platform, StyleSheet } from "react-native";
import { colors } from "../../utils/Colors";
import { rw } from "../../utils/responsive";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgColor
    },
    selectUser: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(203, 213, 224, 1)",
        backgroundColor: 'rgba(57, 82, 153, 0.07)',
        height: 48,

        paddingHorizontal: 14
    },
    innerContainer: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#F2F2F2',
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    row: {
        flexDirection: "row",
        alignItems: 'center',
    },
    placeholer: {
        flex: 1
    },
    listItem: {
        height: 52,
        width: "100%",
        backgroundColor: "white",
        paddingHorizontal: 10,
        shadowOffset: { width: 4, height: 5 },
        shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.1)',
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 8,
        marginBottom: 10,
        borderRadius: 10,
        overflow: 'hidden',
        flex: 1
    },
    iconView: {
        borderColor: colors.blue,
        height: 32,
        width: 32, borderRadius: 32,
        borderWidth: 1
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    creatText: {
        paddingHorizontal: rw(20)
    },
    boxView: {
        paddingHorizontal: rw(4),
        marginTop: 8,
        flex: 1,
        width: '100%'
    },
    heading: {
        flex: 0.34,
        height: 36,
        backgroundColor: colors.blue,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading1: {
        flex: 0.34,
        height: 44,
        backgroundColor: 'rgba(57, 82, 153, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: colors.blue,
        borderBottomWidth: 1,
    },
    innerView: {
        flex: 1,
        width: '100%',
        paddingHorizontal: rw(4),


    },
    createPlanView: {
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: rw(20),
        justifyContent: 'space-between',
    },
    newPlanView: {
        gap: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButton: {
        height: 44,
        paddingHorizontal: 44,
        borderRadius: 6,
        backgroundColor: colors.blue
    },
    dateTimeBox: {
        marginTop: 10,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(203, 213, 224, 1)",
        backgroundColor: "rgba(57, 82, 153, 0.07)",
        paddingHorizontal: 14,
        // flex: 1

    },
    listContainer: {
        position: 'absolute',
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 10,
        maxHeight: 300,
        overflow: 'hidden',
        zIndex:999,
        top:100,
        left:20
    },

});