'use client';

import { MenuItem, Select } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import {
    addDevice,
    editDevice,
    fetchMeterTypes
} from '../../../api/device';
import {
    DeviceScheduleItem,
    fetchAllDeviceSchedules
} from '../../../services/schedule.service';

import type { Device } from '../../../components/dashboard/device/devices-table';

interface AddDeviceFormProps {
    show?: boolean;
    onToggleVisibility: (device: Device | null) => void;
    editingDevice: Device | null;
    setEditingDevice: (device: Device | null) => void;
}

interface MeterTypeItem {
    id: number;
    name: string;
}

export function AddDeviceForm({
    show = true,
    onToggleVisibility,
    editingDevice,
    setEditingDevice
}: AddDeviceFormProps): React.JSX.Element | null {

    const [selectedValue, setSelectedValue] =
        React.useState<'1' | '0'>('1');

    const [txtName, setTxtName] = React.useState('');
    const [txtIP, setTxtIP] = React.useState('');
    const [txtPort, setTxtPort] = React.useState('');
    const [txtConsumerNo, setTxtConsumerNo] = React.useState('');
    const [txtSerialNo, setTxtSerialNo] = React.useState('');
    const [txtClientAddress, setTxtClientAddress] = React.useState('16');
    const [txtServerAddress, setTxtServerAddress] = React.useState('1');
    const [txtAuthentication, setTxtAuthentication] =
        React.useState('None');
    const [txtPassword, setTxtPassword] = React.useState('');
    const [txtTimeout, setTxtTimeout] = React.useState('30000');

    // Meter Type now comes from backend.
    const [meterTypes, setMeterTypes] =
        React.useState<MeterTypeItem[]>([]);

    const [selectedMeterTypeId, setSelectedMeterTypeId] =
        React.useState<number | null>(null);

    const [txtTimeZoneId, setTxtTimeZoneId] =
        React.useState('India Standard Time');

    const [schedules, setSchedules] =
        React.useState<DeviceScheduleItem[]>([]);

    // ONE device can have ONE schedule.
    const [selectedScheduleId, setSelectedScheduleId] =
        React.useState<number | null>(null);

    const [errors, setErrors] = React.useState({
        name: '',
        serialNo: '',
        consumerNo: '',
        ip: '',
        port: '',
        clientAddress: '',
        serverAddress: '',
        timeout: '',
        password: '',
        general: '',
        meterType: ''
    });

    // Load schedules whenever popup opens.
    React.useEffect(() => {
        const loadData = async () => {
            if (!show) return;

            const scheduleData =
                await fetchAllDeviceSchedules();

            setSchedules(scheduleData ?? []);
            const meterTypesData = await fetchMeterTypes();
            setMeterTypes(meterTypesData ?? []);
        };

        loadData();
    }, [show]);

    // Load device data when editing.
    React.useEffect(() => {
        if (editingDevice) {
            setTxtName(editingDevice.name || '');
            setTxtIP(editingDevice.ip || '');
            setTxtConsumerNo(editingDevice.consumerNumber || '');
            setTxtSerialNo(editingDevice.serialNumber || '');
            setTxtPort(editingDevice.port !== undefined && editingDevice.port !== null? 
                String(editingDevice.port): '');

            setSelectedValue(
                editingDevice.isActive ? '1' : '0'
            );

            setTxtClientAddress(
                String(editingDevice.clientAddress ?? 16)
            );

            setTxtServerAddress(
                String(editingDevice.serverAddress ?? 1)
            );

            setTxtAuthentication(
                editingDevice.authentication || 'None'
            );

            setTxtPassword(
                editingDevice.password || ''
            );

            setTxtTimeout(
                String(editingDevice.timeout ?? 30000)
            );

            // Meter Type comes from backend ID.
            setSelectedMeterTypeId(
                editingDevice.meterTypeId ?? null
            );

            setTxtTimeZoneId(
                editingDevice.timeZoneId ||
                    'India Standard Time'
            );

            // ONE device = ONE schedule.
            setSelectedScheduleId(
                editingDevice.deviceSyncScheduleId ?? null
            );

        } else {
            resetForm();
        }
    }, [editingDevice]);

    const resetForm = () => {
        setTxtName('');
        setTxtIP('');
        setTxtPort('');
        setTxtConsumerNo('');
        setTxtSerialNo('');

        setSelectedValue('1');

        setTxtClientAddress('16');
        setTxtServerAddress('1');

        setTxtAuthentication('None');
        setTxtPassword('');
        setTxtTimeout('30000');

        setSelectedMeterTypeId(null);

        setTxtTimeZoneId('India Standard Time');

        // Reset ONE schedule.
        setSelectedScheduleId(null);

        setErrors({
            name: '',
            serialNo: '',
            consumerNo: '',
            ip: '',
            port: '',
            clientAddress: '',
            serverAddress: '',
            timeout: '',
            password: '',
            general: '',
            meterType: ''
        });
    };

    const handleChange = (
        event: SelectChangeEvent<string>
    ) => {
        setSelectedValue(
            event.target.value as '1' | '0'
        );

        setErrors(prev => ({
            ...prev,
            general: ''
        }));
    };

    const handleNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtName(event.target.value);

        setErrors(prev => ({
            ...prev,
            name: '',
            general: ''
        }));
    };

    const handleIPChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtIP(event.target.value);

        setErrors(prev => ({
            ...prev,
            ip: '',
            general: ''
        }));
    };

    const handlePortChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtPort(event.target.value);

        setErrors(prev => ({
            ...prev,
            port: '',
            general: ''
        }));
    };

    const handleConChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtConsumerNo(event.target.value);

        setErrors(prev => ({
            ...prev,
            consumerNo: '',
            general: ''
        }));
    };

    const handleSerChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtSerialNo(event.target.value);

        setErrors(prev => ({
            ...prev,
            serialNo: '',
            general: ''
        }));
    };

    const handleClientAddressChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtClientAddress(event.target.value);

        setErrors(prev => ({
            ...prev,
            clientAddress: '',
            general: ''
        }));
    };

    const handleServerAddressChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtServerAddress(event.target.value);

        setErrors(prev => ({
            ...prev,
            serverAddress: '',
            general: ''
        }));
    };

    const handleAuthenticationChange = (
        event: SelectChangeEvent<string>
    ) => {
        const newAuth = event.target.value;

        setTxtAuthentication(newAuth);

        if (
            newAuth !== 'None' &&
            (txtClientAddress === '16' ||
                !txtClientAddress)
        ) {
            setTxtClientAddress('32');
        } else if (
            newAuth === 'None' &&
            txtClientAddress === '32'
        ) {
            setTxtClientAddress('16');
        }

        setErrors(prev => ({
            ...prev,
            general: ''
        }));
    };

    const handlePasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtPassword(event.target.value);

        setErrors(prev => ({
            ...prev,
            general: ''
        }));
    };

    const handleTimeoutChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTxtTimeout(event.target.value);

        setErrors(prev => ({
            ...prev,
            timeout: '',
            general: ''
        }));
    };

    const handleMeterTypeChange = (
        event: SelectChangeEvent<number>
    ) => {
        const value = Number(event.target.value);

        setSelectedMeterTypeId(
            value === 0 ? null : value
        );

        setErrors(prev => ({
            ...prev,
            meterType: '',
            general: ''
        }));
    };

    // SINGLE schedule selection.
    const handleScheduleChange = (
        event: SelectChangeEvent<number>
    ) => {
        const value = Number(event.target.value);

        setSelectedScheduleId(
            value === 0 ? null : value
        );

        setErrors(prev => ({
            ...prev,
            general: ''
        }));
    };

    const validateForm = (): boolean => {
        const newErrors = {
            name: '',
            serialNo: '',
            consumerNo: '',
            ip: '',
            port: '',
            clientAddress: '',
            serverAddress: '',
            timeout: '',
            password: '',
            general: '',
            meterType: ''
        };

        let isValid = true;

        if (!txtName.trim()) {
            newErrors.name =
                'Device name is required';
            isValid = false;
        }

        if (!txtSerialNo.trim()) {
            newErrors.serialNo =
                'Serial number is required';
            isValid = false;
        }

        if (!txtConsumerNo.trim()) {
            newErrors.consumerNo =
                'Consumer number is required';
            isValid = false;
        }

        if (
            selectedMeterTypeId === null ||
            selectedMeterTypeId === undefined
        ) {
            newErrors.meterType =
                'Meter type is required';
            isValid = false;
        }

        const ipRegex =
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

        if (!txtIP.trim()) {
            newErrors.ip =
                'IP address is required';
            isValid = false;
        } else if (!ipRegex.test(txtIP)) {
            newErrors.ip =
                'Invalid IP address format';
            isValid = false;
        }

        const portNum =
            parseInt(txtPort, 10);

        if (!txtPort.trim()) {
            newErrors.port =
                'Port is required';
            isValid = false;
        } else if (
            isNaN(portNum) ||
            portNum < 1 ||
            portNum > 65535
        ) {
            newErrors.port =
                'Port must be a number between 1 and 65535';
            isValid = false;
        }

        const clientAddrNum =
            parseInt(txtClientAddress, 10);

        if (!txtClientAddress.trim()) {
            newErrors.clientAddress =
                'Client address is required';
            isValid = false;
        } else if (
            isNaN(clientAddrNum) ||
            clientAddrNum < 0
        ) {
            newErrors.clientAddress =
                'Must be a non-negative number';
            isValid = false;
        }

        const serverAddrNum =
            parseInt(txtServerAddress, 10);

        if (!txtServerAddress.trim()) {
            newErrors.serverAddress =
                'Server address is required';
            isValid = false;
        } else if (
            isNaN(serverAddrNum) ||
            serverAddrNum < 0
        ) {
            newErrors.serverAddress =
                'Must be a non-negative number';
            isValid = false;
        }

        const timeoutNum =
            parseInt(txtTimeout, 10);

        if (!txtTimeout.trim()) {
            newErrors.timeout =
                'Timeout is required';
            isValid = false;
        } else if (
            isNaN(timeoutNum) ||
            timeoutNum < 100
        ) {
            newErrors.timeout =
                'Timeout must be at least 100ms';
            isValid = false;
        }

        if (
            txtAuthentication !== 'None' &&
            !txtPassword.trim()
        ) {
            newErrors.password =
                'Password is required when Authentication is enabled';
            isValid = false;
        }

        setErrors(newErrors);

        return isValid;
    };

    const handleSubmit = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();

        if (!validateForm()) return;

        const device: Device = {
            id: editingDevice?.id || 0,
            name: txtName,
            isActive: selectedValue,
            ip: txtIP, 
            port: Number(txtPort),
            consumerNumber: txtConsumerNo,
            serialNumber: txtSerialNo,
            clientAddress: Number(txtClientAddress),
            serverAddress: Number(txtServerAddress),
            authentication: txtAuthentication,
            password: txtPassword,
            timeout: Number(txtTimeout),

            // Backend MeterType ID.
            meterTypeId: selectedMeterTypeId,

            timeZoneId:
                txtTimeZoneId ||
                'India Standard Time',

            // ONE device = ONE schedule.
            deviceSyncScheduleId:
                selectedScheduleId
        };

        try {
            let result: any;

            if (editingDevice) {
                result = await editDevice(
                    device,
                );
            } else {
                result = await addDevice(
                    device
                );
            }

            if (!result?.status) {
                setErrors(prev => ({
                    ...prev,
                    general:
                        result?.errors ||
                        'Failed to save device'
                }));

                return;
            }

            resetForm();

            setEditingDevice(null);
            onToggleVisibility(null);

        } catch (error) {
            console.error(
                'Error saving device:',
                error
            );

            setErrors(prev => ({
                ...prev,
                general:
                    'Failed to save device'
            }));
        }
    };

    const cancelDeviceClick = (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();

        resetForm();

        setEditingDevice(null);
        onToggleVisibility(null);
    };

    return (
        <form
            onSubmit={event =>
                event.preventDefault()
            }
        >
            <Dialog
                open={show}
                onClose={() =>
                    onToggleVisibility(null)
                }
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh'
                    }
                }}
            >
                <DialogTitle
                    sx={{
                        py: 1.25,
                        px: 3,
                        fontSize: '1.05rem',
                        fontWeight: 600
                    }}
                >
                    {editingDevice
                        ? 'Edit Device'
                        : 'Add Device'}
                </DialogTitle>

                <Divider />

                <DialogContent
                    dividers
                    sx={{
                        py: 1.5,
                        px: 3,
                        overflowY: 'auto'
                    }}
                >
                    <Grid
                        container
                        spacing={1.5}
                    >
                        <Grid size={12}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    fontWeight: 600,
                                    color: 'text.primary',
                                    mb: 0.25
                                }}
                            >
                                Device Information
                            </Typography>
                        </Grid>

                        {/* DEVICE NAME */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.name}
    >
        <InputLabel>
            Device Name
        </InputLabel>

        <OutlinedInput
            label="Device Name"
            value={txtName}
            onChange={handleNameChange}
        />

        {errors.name && (
            <FormHelperText>
                {errors.name}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* SERIAL NUMBER */}
                        <Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.serialNo}
    >
        <InputLabel>
            Serial Number
        </InputLabel>

        <OutlinedInput
            label="Serial Number"
            value={txtSerialNo}
            onChange={handleSerChange}
        />

        {errors.serialNo && (
            <FormHelperText>
                {errors.serialNo}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* CONSUMER NUMBER */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.consumerNo}
    >
        <InputLabel>
            Consumer Number
        </InputLabel>

        <OutlinedInput
            label="Consumer Number"
            name="consumerNo"
            type="text"
            value={txtConsumerNo}
            onChange={handleConChange}
        />

        {errors.consumerNo && (
            <FormHelperText>
                {errors.consumerNo}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* STATUS */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
    >
        <InputLabel id="isactive-label">
            Status
        </InputLabel>

        <Select
            labelId="isactive-label"
            id="isactive"
            name="isactive"
            value={selectedValue}
            label="Status"
            onChange={handleChange}
        >
            <MenuItem value="1">
                Active
            </MenuItem>

            <MenuItem value="0">
                Inactive
            </MenuItem>
        </Select>
    </FormControl>
</Grid>

{/* METER TYPE */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.meterType}
    >
        <InputLabel id="metertype-label">
            Meter Type
        </InputLabel>

        <Select
            labelId="metertype-label"
            id="metertype"
            name="metertype"
            value={selectedMeterTypeId ?? ""}
            label="Meter Type"
            onChange={handleMeterTypeChange}
            displayEmpty
        >
            {meterTypes.map(type => (
                <MenuItem
                    key={type.id}
                    value={type.id}
                >
                    {type.name}
                </MenuItem>
            ))}
        </Select>

        {errors.meterType && (
            <FormHelperText>
                {errors.meterType}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* TIME ZONE */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
    >
        <InputLabel id="timezone-label">
            Time Zone
        </InputLabel>

        <Select
            labelId="timezone-label"
            id="timezone"
            name="timezone"
            value={txtTimeZoneId}
            label="Time Zone"
            onChange={e =>
                setTxtTimeZoneId(e.target.value)
            }
        >
            <MenuItem value="India Standard Time">
                India Standard Time (IST)
            </MenuItem>

            <MenuItem value="UTC">
                Coordinated Universal Time (UTC)
            </MenuItem>

            <MenuItem value="EST Standard Time">
                Eastern Standard Time (EST)
            </MenuItem>

            <MenuItem value="SE Asia Standard Time">
                SE Asia Standard Time (ICT)
            </MenuItem>
        </Select>
    </FormControl>
</Grid>

{/* SCHEDULE */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
    >
        <InputLabel id="schedule-label">
            Schedule
        </InputLabel>

        <Select
            labelId="schedule-label"
            id="schedule"
            name="schedule"
            value={selectedScheduleId ?? ""}
            label="Schedule"
            onChange={handleScheduleChange}
            displayEmpty
        >
            {schedules
                .filter(schedule => schedule.isEnabled)
                .map(schedule => (
                    <MenuItem
                        key={schedule.id}
                        value={schedule.id}
                    >
                        {schedule.scheduledTime} -{" "}
                        {schedule.repeatMode}
                    </MenuItem>
                ))}
        </Select>
    </FormControl>
</Grid>

{/* CONNECTION SETTINGS */}
<Grid size={12}>
    <Typography
        variant="subtitle2"
        sx={{
            fontWeight: 600,
            color: 'text.primary',
            mt: 0.5,
            mb: 0.25
        }}
    >
        Connection Settings
    </Typography>
</Grid>

{/* IP */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.ip}
    >
        <InputLabel>
            IP Address
        </InputLabel>

        <OutlinedInput
            label="IP Address"
            name="ip"
            type="text"
            value={txtIP}
            onChange={handleIPChange}
        />

        {errors.ip && (
            <FormHelperText>
                {errors.ip}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* PORT */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.port}
    >
        <InputLabel>
            Port
        </InputLabel>

        <OutlinedInput
            label="Port"
            name="port"
            type="text"
            value={txtPort}//1234
            onChange={handlePortChange}
        />

        {errors.port && (
            <FormHelperText>
                {errors.port}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* CLIENT ADDRESS */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.clientAddress}
    >
        <InputLabel>
            Client Address
        </InputLabel>

        <OutlinedInput
            label="Client Address"
            name="clientAddress"
            type="number"
            value={txtClientAddress}
            onChange={handleClientAddressChange}
        />

        {errors.clientAddress && (
            <FormHelperText>
                {errors.clientAddress}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* SERVER ADDRESS */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.serverAddress}
    >
        <InputLabel>
            Server Address
        </InputLabel>

        <OutlinedInput
            label="Server Address"
            name="serverAddress"
            type="number"
            value={txtServerAddress}
            onChange={handleServerAddressChange}
        />

        {errors.serverAddress && (
            <FormHelperText>
                {errors.serverAddress}
            </FormHelperText>
        )}
    </FormControl>
</Grid>

{/* AUTHENTICATION */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
    >
        <InputLabel id="auth-label">
            Authentication
        </InputLabel>

        <Select
            labelId="auth-label"
            id="authentication"
            name="authentication"
            value={txtAuthentication}
            label="Authentication"
            onChange={handleAuthenticationChange}
        >
            <MenuItem value="None">
                None
            </MenuItem>

            <MenuItem value="Low">
                Low (Password)
            </MenuItem>

            <MenuItem value="High">
                High (HLS)
            </MenuItem>

            <MenuItem value="HighGmac">
                High GMAC
            </MenuItem>

            <MenuItem value="HighSha256">
                High SHA-256
            </MenuItem>

            <MenuItem value="HighEcdsa">
                High ECDSA
            </MenuItem>
        </Select>
    </FormControl>
</Grid>

{/* PASSWORD */}
{txtAuthentication !== 'None' && (
    <Grid
        size={{
            xs: 12,
            md: 6
        }}
    >
        <FormControl
            fullWidth
            size="small"
            error={!!errors.password}
        >
            <InputLabel>
                Password
            </InputLabel>

            <OutlinedInput
                label="Password"
                name="password"
                type="password"
                value={txtPassword}
                onChange={handlePasswordChange}
            />

            {errors.password && (
                <FormHelperText>
                    {errors.password}
                </FormHelperText>
            )}
        </FormControl>
    </Grid>
)}

{/* TIMEOUT */}
<Grid
    size={{
        xs: 12,
        md: 6
    }}
>
    <FormControl
        fullWidth
        size="small"
        error={!!errors.timeout}
    >
        <InputLabel>
            Timeout (ms)
        </InputLabel>

        <OutlinedInput
            label="Timeout (ms)"
            name="timeout"
            type="number"
            value={txtTimeout}
            onChange={handleTimeoutChange}
        />

        {errors.timeout && (
            <FormHelperText>
                {errors.timeout}
            </FormHelperText>
        )}
        </FormControl>
    </Grid>

                        {/* GENERAL ERROR */}
                        {errors.general && (
                            <Grid size={12}>
                                <Typography
                                    variant="subtitle2"
                                    color="error"
                                    sx={{
                                        fontWeight: 600
                                    }}
                                >
                                    Validation Errors
                                </Typography>

                                <FormHelperText error>
                                    {(Array.isArray(
                                        errors.general
                                    )
                                        ? errors.general
                                        : [errors.general]
                                    ).map(
                                        (
                                            err,
                                            index
                                        ) => (
                                            <span
                                                key={
                                                    index
                                                }
                                                style={{
                                                    display:
                                                        'block'
                                                }}
                                            >
                                                {err}
                                            </span>
                                        )
                                    )}
                                </FormHelperText>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <Divider />

                <DialogActions
                    sx={{
                        py: 1.5,
                        px: 3,
                        justifyContent:
                            'flex-end'
                    }}
                >
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={
                            cancelDeviceClick
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        size="small"
                        onClick={handleSubmit}
                    >
                        {editingDevice
                            ? 'Update'
                            : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </form>
    );
}