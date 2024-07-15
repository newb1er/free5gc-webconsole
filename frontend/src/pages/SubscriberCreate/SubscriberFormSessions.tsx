import {
  Button,
  Box,
  Card,
  Checkbox,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
} from "@mui/material";
import { useSubscriptionForm } from "../../hooks/subscription-form";
import { toHex } from "../../lib/utils";
import FormChargingConfig from "./FormCharingConfig";
import FormFlowRule from "./FormFlowRule";
import FormUpSecurity from "./FormUpSecurity";
import axios from "../../axios";
import { Controller, useFieldArray } from "react-hook-form";
import { defaultDnnConfig, defaultSnssaiConfiguration } from "../../lib/dtos/subscription";
import { useState } from "react";

interface VerifyScope {
  supi: string;
  sd: string;
  sst: number;
  dnn: string;
  ipaddr: string;
}

interface VerifyResult {
  ipaddr: string;
  valid: boolean;
  cause: string;
}

const handleVerifyStaticIp = (sd: string, sst: number, dnn: string, ipaddr: string) => {
  const scope: VerifyScope = {
    supi: "",
    sd: sd,
    sst: sst,
    dnn: dnn,
    ipaddr: ipaddr,
  };
  axios.post("/api/verify-staticip", scope).then((res) => {
    const result = res.data as VerifyResult;
    console.log(result);
    if (result["valid"] === true) {
      alert("OK\n" + result.ipaddr);
    } else {
      alert("NO!\nCause: " + result["cause"]);
    }
  });
};

export default function SubscriberFormSessions() {
  const { register, validationErrors, getValues, setValue, control } = useSubscriptionForm();

  const {
    fields: snssaiConfigurations,
    append: appendSnssaiConfiguration,
    remove: removeSnssaiConfiguration,
  } = useFieldArray({
    control,
    name: "SnssaiConfigurations",
  });

  const [dnnName, setDnnName] = useState<string[]>(Array(snssaiConfigurations.length).fill(""));
  const dnnValue = (index: number) => {
    return dnnName[index];
  };

  const handleChangeDNN = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ): void => {
    dnnName[index] = event.target.value;
    setDnnName(dnnName);
  };

  const onDnnAdd = (index: number) => {
    const name = dnnName[index];
    if (name === undefined || name === "") {
      return;
    }

    setValue(`SnssaiConfigurations.${index}.dnnConfigurations.${name}`, defaultDnnConfig());
    setDnnName({ ...dnnName, [index]: "" });
  };

  const onDnnDelete = (index: number, dnn: string, slice: string) => {
    const session = getValues()["SnssaiConfigurations"][index];
    if (session.dnnConfigurations === undefined) {
      return;
    }
    delete session.dnnConfigurations[dnn];
    setValue(`SnssaiConfigurations.${index}`, session);
  };

  return (
    <>
      {snssaiConfigurations?.map((row, index) => (
        <div key={row.id} id={toHex(row.sst) + row.sd}>
          <Grid container spacing={2}>
            <Grid item xs={10}>
              <h3>S-NSSAI Configuragtion ({toHex(row.sst) + row.sd})</h3>
            </Grid>
            <Grid item xs={2}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => removeSnssaiConfiguration(index)}
                  sx={{ m: 2, backgroundColor: "red", "&:hover": { backgroundColor: "red" } }}
                >
                  DELETE
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Card variant="outlined">
            <Table>
              <TableBody id={"S-NSSAI Configuragtion" + toHex(row.sst) + row.sd}>
                <TableRow>
                  <TableCell style={{ width: "50%" }}>
                    <TextField
                      {...register(`SnssaiConfigurations.${index}.sst`, {
                        required: true,
                      })}
                      error={validationErrors.SnssaiConfigurations?.[index]?.sst !== undefined}
                      label="SST"
                      variant="outlined"
                      required
                      fullWidth
                      type="number"
                    />
                  </TableCell>
                  <TableCell style={{ width: "50%" }}>
                    <TextField
                      {...register(`SnssaiConfigurations.${index}.sd`, {
                        required: true,
                      })}
                      error={validationErrors.SnssaiConfigurations?.[index]?.sd !== undefined}
                      label="SD"
                      variant="outlined"
                      required
                      fullWidth
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
              <TableBody id={toHex(row.sst) + row.sd + "-Default S-NSSAI"}>
                <TableRow>
                  <TableCell>Default S-NSSAI</TableCell>
                  <TableCell align="right">
                    <Controller
                      control={control}
                      name={`SnssaiConfigurations.${index}.isDefault`}
                      render={(props) => <Checkbox {...props.field} checked={props.field.value} />}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <FormChargingConfig snssaiIndex={index} />

            {Object.keys(row.dnnConfigurations).map((dnn) => (
              <div key={dnn} id={toHex(row.sst) + row.sd + "-" + dnn}>
                <Box sx={{ m: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={10}>
                      <h4>DNN Configurations</h4>
                    </Grid>
                    <Grid item xs={2}>
                      <Box display="flex" justifyContent="flex-end">
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={() => onDnnDelete(index, dnn, toHex(row.sst) + row.sd)}
                          sx={{
                            m: 2,
                            backgroundColor: "red",
                            "&:hover": { backgroundColor: "red" },
                          }}
                        >
                          DELETE
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                  <Card
                    variant="outlined"
                    id={toHex(row.sst) + row.sd + "-" + dnn! + "-AddFlowRuleArea"}
                  >
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <b>{dnn}</b>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                      <TableBody id={toHex(row.sst) + row.sd + "-" + dnn! + "-AMBR&5QI"}>
                        <TableRow>
                          <TableCell>
                            <TextField
                              {...register(
                                `SnssaiConfigurations.${index}.dnnConfigurations.${dnn}.sessionAmbr.uplink`,
                                { required: true },
                              )}
                              label="Uplink AMBR"
                              variant="outlined"
                              required
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              {...register(
                                `SnssaiConfigurations.${index}.dnnConfigurations.${dnn}.sessionAmbr.downlink`,
                                { required: true },
                              )}
                              label="Downlink AMBR"
                              variant="outlined"
                              required
                              fullWidth
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              {...register(
                                `SnssaiConfigurations.${index}.dnnConfigurations.${dnn}.default5qi`,
                                { required: true, valueAsNumber: true },
                              )}
                              label="Default 5QI"
                              variant="outlined"
                              required
                              fullWidth
                              type="number"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell style={{ width: "80%" }}>
                            <TextField
                              {...register(
                                `SnssaiConfigurations.${index}.dnnConfigurations.${dnn}.staticIpv4Address`,
                              )}
                              error={
                                validationErrors.SnssaiConfigurations?.[index]?.dnnConfigurations?.[
                                  dnn
                                ]?.staticIpv4Address !== undefined
                              }
                              label="IPv4 Address"
                              variant="outlined"
                              fullWidth
                            />
                          </TableCell>
                          <TableCell style={{ width: "20%" }}>
                            <Button
                              color="secondary"
                              variant="contained"
                              // handleVerifyStaticIp = (sd: string, sst: number, dnn: string, ipaddr: string)
                              onClick={() =>
                                handleVerifyStaticIp(
                                  row.sd,
                                  row.sst,
                                  dnn,
                                  row.dnnConfigurations[dnn].staticIpv4Address ?? "",
                                )
                              }
                              sx={{
                                m: 2,
                                backgroundColor: "blue",
                                "&:hover": { backgroundColor: "#7496c2" },
                              }}
                              disabled={row.dnnConfigurations[dnn].staticIpv4Address?.length == 0}
                            >
                              Verify
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

                    <FormFlowRule
                      snssaiIndex={index}
                      dnn={dnn}
                      snssai={{ sst: row.sst, sd: row.sd }}
                    />

                    <FormUpSecurity sessionIndex={index} dnnKey={dnn} />
                  </Card>
                </Box>
              </div>
            ))}
            <Grid container spacing={2}>
              <Grid item xs={10} id={toHex(row.sst) + row.sd + "-AddDNNInputArea"}>
                <Box sx={{ m: 2 }}>
                  <TextField
                    label="Data Network Name"
                    variant="outlined"
                    fullWidth
                    value={dnnValue(index)}
                    onChange={(ev) => handleChangeDNN(ev, index)}
                  />
                </Box>
              </Grid>
              <Grid item xs={2} id={toHex(row.sst) + row.sd + "-AddDNNButtonArea"}>
                <Box display="flex" justifyContent="flex-end">
                  <Button
                    color="secondary"
                    variant="contained"
                    onClick={() => onDnnAdd(index)}
                    sx={{ m: 3 }}
                  >
                    &nbsp;&nbsp;+DNN&nbsp;&nbsp;
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </div>
      ))}

      <br />
      <Grid item xs={12}>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => appendSnssaiConfiguration(defaultSnssaiConfiguration())}
          sx={{ m: 1 }}
        >
          +SNSSAI
        </Button>
      </Grid>
    </>
  );
}
