import React, { Component }              from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';

import { createCustomStackNavigator }         from 'components/navigation/Navigator';
import { DrawerButton }                       from 'components/navigation/Header';
import ScreenContainer                        from 'components/ScreenContainer';
import ProfilePicture                         from 'components/ProfilePicture';
import Separator                              from 'components/Separator';
import InputText                              from 'components/inputs/InputText';
import InputPicker                            from 'components/inputs/InputPicker';
import { PrimaryButton, SecondaryIconButton } from 'components/action/Button';
import { PrimaryLink }                        from 'components/action/Link';

import { getResidences }                              from 'services/ResidencesService';
import { getProfile, getProfilePicture, saveProfile } from 'services/ProfileService';

import Colors from 'utils/Colors';

class ProfileForm extends Component {
  static navigationOptions = {
    title: 'Meus dados', 
    headerLeft: <DrawerButton />
  };

  state = { 
    profile:        { phones: [{}] },
    profilePicture: undefined,
    residences:     [],
    loading:        true,
  };

  componentDidMount() {
    this.loadData();
  };

  loadData = async () => {
    const profile        = await getProfile();
    const profilePicture = getProfilePicture();
    const residences     = await getResidences();

    this.setState({
      loading: false,
      profile: {...profile},
      profilePicture,
      residences,
    });
  };

  addPhone = () => {
    this.setState(state => {
      state.profile.phones.push({});
      return state;
    });
  };

  removePhone = (index) => {
    this.setState(state => {
      state.profile.phones.splice(index, 1);
      if (!state.profile.phones.length)
        state.profile.phones.push({});
      return state;
    });
  };

  save = async () => {
    const { profile, profilePicture } = this.state;

    this.setState({ loading: true, });

    try {
      const savedProfile = await saveProfile(profile, profilePicture);
      this.setState({ profile: {...savedProfile} });
      Alert.alert(undefined, 'Perfil salvo com sucesso!', [{ text: 'OK' }]);
    } catch(error) {
      Alert.alert(undefined, error, [{ text: 'OK' }]);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { loading, profile, profilePicture, residences } = this.state;
    const { navigation }                                   = this.props;

    const selectedResidence = profile.residence && residences.find(residence => residence.id == profile.residence.id);

    return (
      <ScreenContainer loading={loading} style={styles.container}>
        <ProfilePicture 
          uri={profilePicture} 
          onSelect={(uri) => {
            console.log('PICTURE URI: ', uri.substr(0, 40));
            this.setState({ profilePicture: uri })
          }} 
          style={styles.profilePicture} 
        />

        <InputText 
          style={styles.input}
          textContentType="name" 
          label="Nome"
          leftIcon="user"
          placeholder="Informe seu nome" 
          value={profile.name}
          onChangeText={(name) => this.setState(state => {
            state.profile.name = name;
            return state;
          })}
        />
        
        <InputText 
          style={styles.input}
          textContentType="username"
          keyboardType="number-pad" 
          maxLength={11} 
          label="CPF" 
          leftIcon="id-card" 
          placeholder="Informe seu CPF" 
          value={profile.cpf}
          onChangeText={(cpf) => this.setState(state => {
            state.profile.cpf = cpf;
            return state;
          })}
        />
        
        <InputPicker 
          style={styles.input} 
          label="Residência" 
          leftIcon="home" 
          placeholder="Selecione a sua residência" 
          value={selectedResidence}
          data={residences}
          itemLabelExtractor={residence => `${residence.residenceGroup.name} ${residence.name}`}
          onChange={(residence) => this.setState(state => {
            state.profile.residence = residence;
            return state;
          })}
        />

        <Separator text="DADOS DE CONTATO" style={styles.input} />

        <InputText 
          style={styles.input}
          textContentType="emailAddress" 
          keyboardType="email-address" 
          label="Endereço de e-mail" 
          leftIcon="at"
          placeholder="Informe o seu e-mail" 
          value={profile.email}
          onChangeText={(email) => this.setState(state => {
            state.profile.email = email;
            return state;
          })}
        />

        {profile.phones.map((phone, index) => {
          return <View style={[styles.phoneContainer, styles.input]} key={index}>
            <InputText 
              style={styles.phoneInput}
              textContentType="telephoneNumber" 
              keyboardType="number-pad" 
              label={'Telefone para contato ' + (index + 1)} 
              leftIcon="phone"
              placeholder="Informe o número do telefone" 
              value={phone.number}
              onChangeText={(phoneNumber) => this.setState(state => {
                phone.number = phoneNumber;
                return state;
              })}
            />
            <SecondaryIconButton icon="trash-alt" style={styles.deleteButton} onPress={() => this.removePhone(index)} disabled={profile.phones.length < 2} /> 
          </View>
        })}

        <PrimaryLink text="Adicionar outro telefone" style={styles.input} onPress={() => this.addPhone()} /> 

        <PrimaryButton title="Salvar" onPress={this.save} />
      </ScreenContainer> 
    );
  };
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },

  profilePicture: {
    alignSelf: 'stretch',
    paddingBottom: 24,
  },

  input: {
    marginBottom: 24,
  },

  phoneInput: {
    flex: 1,
    marginRight: 12
  },

  phoneContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
  },
});

export default createCustomStackNavigator({ ProfileForm });