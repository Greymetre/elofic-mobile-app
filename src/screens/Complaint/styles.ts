import { Platform, StyleSheet } from "react-native";
import { rw } from "../../utils/responsive";
import { colors } from "../../utils/Colors";
import { fonts, shadowStyle } from "../../utils/typography";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eef2fa'
    },
    header: {
        backgroundColor: '#1a3a6c',
        padding: 16,
        paddingTop: 35,
        gap: 14
    },
    row: {
        flexDirection: "row",
        alignItems: "center"
    },
    headsetView: {
        height: 40,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.2)'
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: rw(18),
        height: rw(18),
    },
    typeView: {
        marginTop: 14,
        width: "100%",
        paddingHorizontal: 16,
        gap: 10
    },
    typeInnerBox: {
        borderRadius: 12,
        paddingHorizontal: 14,
        // gap: 2,
        backgroundColor: 'white',
        flex: 1,
        paddingTop: 10,
        paddingBottom: 4,
        shadowOffset: { width: 4, height: 5 },
        shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.6)',
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 8
    },
    iconView: {
        height: 30,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "#cfd9f6",
        overflow: 'hidden',
        borderRadius: 8,
    },
    inputFilterView: {
        gap: 8,
        marginTop: 14,
        paddingHorizontal: 16,
        marginBottom: 12
    },
    input: {
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 10,
        backgroundColor: 'white',
        flex: 1,
        gap: 8
    },
    singleInput: {
        flex: 1,
        width: "100%",
        color: "black",
        fontFamily: fonts.InterBold,
        fontSize: 12
    },
    filterView: {
        height: 40,
        width: 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        backgroundColor: 'white',
    },
    center: {
        justifyContent: 'center',
        alignItems: "center"
    },
    basicDetailsview: {
        backgroundColor: "white",
        shadowOffset: { width: 4, height: 5 },
        shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.4)',
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 8,
        borderRadius: 14,
        overflow: "hidden",

    },
    heading: {
        // height: 45,
        alignItems: "center",
        gap: 10,
        backgroundColor: "#1a3a6c",
        paddingHorizontal: 14,
        paddingVertical: 14
    },
    box: {
        height: 30,
        width: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "rgba(255,255,255,0.2)"
    },
    innerView: {
        flex: 1,
        backgroundColor: 'white',
        paddingVertical: 14,
        paddingHorizontal: 14,
        gap: 14
    },
    twoInput: {
        flex: 1,
        gap: 10
    },
    firstInput: {
        flex: 1,

    },
    partNo: {
        borderRadius: 10,
        height: 40,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        color: "black",
        fontFamily: fonts.InterBold,
        fontSize: 12,
        marginTop: 10,
        paddingHorizontal: 10
    },
    infoview: {
        gap: 8,
        marginTop: 8
    },
    partNoMultiline: {
        borderRadius: 10,
        minHeight: 80,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        color: 'black',
        fontFamily: fonts.InterBold,
        fontSize: 12,
        marginTop: 10,
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    photoVoiceTab: {
        gap: 12
    },
    photView: {
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.4)'
    },
    activePhotoVoiceTab: {
        backgroundColor: '#1a3a6c',
        borderColor: '#1a3a6c',
    },
    voiceView: {
        marginVertical: 10,
        marginBottom: 15
    },
    micView: {
        height: 60,
        width: 60,
        borderRadius: 60,
        backgroundColor: 'rgb(205, 44, 44)',
        shadowOffset: { width: 4, height: 5 },
        shadowColor: Platform.OS == "ios" ? 'rgba(0,0,0,0.03)' : 'rgba(255,0,0,0.3)',
        shadowOpacity: 1,
        shadowRadius: 5,
        elevation: 8
    },
    buttonView:{
        gap: 12,
        alignItems:"center"
    },
    resetBtn:{
        flex: 0.3,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.7)",
        // backgroundColor:"white",
        height: 48,
        borderRadius: 14,
        gap: 8
    },
    firstrowView:{
        gap: 12,
    },
    firstItem:{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 12,
        overflow:"hidden",
        paddingHorizontal: 12,
        paddingVertical: 6
    },

});